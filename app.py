from typing import TypedDict
import sys

# Agent progress messages include Unicode symbols. Windows terminals may default
# to a legacy code page that raises during workflow execution.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from langgraph.graph import StateGraph, START, END

from agents.profile_agent import create_profile
from agents.activity_agent import find_activities
from agents.planner_agent import plan_activities
from agents.budget_agent import calculate_budget
from agents.critic_agent import evaluate_plan


# =========================================
# TRAVEL STATE
# =========================================

class TravelState(TypedDict):

    budget: int
    destination: str
    duration_days: int
    group_size: int
    traveler_type: str
    interests: list
    walking_level: str

    profile: dict
    activities: list
    planned_activities: list
    budget_result: dict
    critic_result: dict

    revision_count: int


# =========================================
# PROFILE AGENT
# =========================================

def profile_node(state: TravelState):

    print("\n🧳 Profile Agent running...")

    profile = create_profile(
        budget=state["budget"],
        duration_days=state["duration_days"],
        group_size=state["group_size"],
        traveler_type=state["traveler_type"],
        interests=state["interests"],
        walking_level=state["walking_level"]
    )

    print("✅ Profile created!")

    return {
        "profile": profile
    }


# =========================================
# ACTIVITY AGENT
# =========================================

def activity_node(state: TravelState):

    print("\n🎯 Activity Agent running...")

    results = find_activities(
        interests=state["interests"],
        traveler_type=state["traveler_type"],
        budget=state["budget"]
    )

    destination = state.get("destination", "").strip().lower()
    if destination:
        results = [
            result for result in results
            if destination in [
                str(location).strip().lower()
                for location in result["activity"].get("location", [])
            ]
        ]

    activities = [
        result["activity"]
        for result in results
    ]

    print(
        f"✅ Found {len(activities)} candidate activities!"
    )

    return {
        "activities": activities
    }


# =========================================
# PLANNER AGENT
# =========================================

def planner_node(state: TravelState):

    print("\n🧠 Planner Agent running...")

    revision_count = state["revision_count"]

    candidates = list(
        state["activities"]
    )

    # -----------------------------------------
    # REVISION MODE
    # -----------------------------------------

    if revision_count > 0:

        print(
            f"🔄 Planner revision #{revision_count}"
        )

        previous_plan = state[
            "planned_activities"
        ]

        if previous_plan:

            def get_cost(activity):

                cost = activity.get(
                    "estimated_cost_inr",
                    {}
                )

                if isinstance(cost, dict):

                    return cost.get(
                        "min",
                        0
                    )

                return cost

            # Remove the most expensive
            # activity from previous plan.
            most_expensive = max(
                previous_plan,
                key=get_cost
            )

            print(
                f"🔧 Removing: "
                f"{most_expensive['name']}"
            )

            candidates = [
                activity
                for activity in candidates
                if activity["name"]
                != most_expensive["name"]
            ]

    # -----------------------------------------
    # CREATE PLAN
    # -----------------------------------------

    # Reserve the fixed estimated costs before allocating money to activities.
    # This prevents the planner's activity allowance from using the whole trip budget.
    fixed_costs = (
        1500 * state["duration_days"]
        + 500 * state["group_size"] * state["duration_days"]
        + 500
    )
    activity_budget = max(0, state["budget"] - fixed_costs)

    planned_activities = plan_activities(
        activities=candidates,
        budget=activity_budget,
        duration_days=state["duration_days"],
        group_size=state["group_size"],
        traveler_type=state["traveler_type"],
        interests=state["interests"],
        walking_level=state["walking_level"]
    )

    print(
        f"✅ Planner selected "
        f"{len(planned_activities)} activities!"
    )

    print("\n📋 Selected Activities:")

    if planned_activities:

        for i, activity in enumerate(
            planned_activities,
            start=1
        ):

            print(
                f"{i}. {activity['name']}"
            )

    else:

        print("No activities selected.")

    return {
        "planned_activities": planned_activities
    }


# =========================================
# BUDGET AGENT
# =========================================

def budget_node(state: TravelState):

    print("\n💰 Budget Agent running...")

    accommodation_cost = (
        1500
        * state["duration_days"]
    )

    food_cost = (
        500
        * state["group_size"]
        * state["duration_days"]
    )

    activity_cost = 0

    for activity in state[
        "planned_activities"
    ]:

        cost = activity.get(
            "estimated_cost_inr",
            {}
        )

        if isinstance(cost, dict):

            activity_cost += cost.get(
                "min",
                0
            )

        else:

            activity_cost += cost

    transport_cost = 500

    budget_result = calculate_budget(
        total_budget=state["budget"],
        accommodation_cost=accommodation_cost,
        food_cost=food_cost,
        activity_cost=activity_cost,
        transport_cost=transport_cost
    )

    print(
        f"💰 Estimated total cost: "
        f"₹{budget_result['total_expense']}"
    )

    if budget_result[
        "remaining_budget"
    ] >= 0:

        print(
            f"✅ Remaining budget: "
            f"₹{budget_result['remaining_budget']}"
        )

    else:

        print(
            f"⚠️ Budget exceeded by: "
            f"₹{abs(budget_result['remaining_budget'])}"
        )

    return {
        "budget_result": budget_result
    }


# =========================================
# CRITIC AGENT
# =========================================

def critic_node(state: TravelState):

    print("\n🔍 Critic Agent running...")

    budget_result = state[
        "budget_result"
    ]

    total_budget = state[
        "budget"
    ]

    total_cost = budget_result[
        "total_expense"
    ]

    duration_days = state[
        "duration_days"
    ]

    activities_count = len(
        state["planned_activities"]
    )

    walking_level = state[
        "walking_level"
    ]

    activity_levels = []

    for activity in state[
        "planned_activities"
    ]:

        walking = activity.get(
            "walking_required",
            "low"
        )

        activity_levels.append(
            walking
        )

    review = evaluate_plan(
        total_budget=total_budget,
        total_cost=total_cost,
        duration_days=duration_days,
        activities_count=activities_count,
        walking_level=walking_level,
        activity_levels=activity_levels
    )

    print(
        f"🔍 Critic Status: "
        f"{review['status']}"
    )

    if review["issues"]:

        print("\n⚠️ Issues:")

        for issue in review["issues"]:

            print(
                f"- {issue}"
            )

    else:

        print(
            "✅ No major issues found!"
        )

    return {
        "critic_result": review
    }


# =========================================
# ROUTER
# =========================================

def critic_router(state: TravelState):

    status = state[
        "critic_result"
    ]["status"]

    revision_count = state[
        "revision_count"
    ]

    # Maximum 2 revisions.
    if (
        status == "NEEDS_REVISION"
        and revision_count < 2
    ):

        return "revise"

    return "finish"


# =========================================
# REVISION NODE
# =========================================

def revision_node(state: TravelState):

    new_revision_count = (
        state["revision_count"] + 1
    )

    print(
        f"\n🔄 Starting revision "
        f"#{new_revision_count}"
    )

    return {
        "revision_count":
            new_revision_count
    }


# =========================================
# INITIAL STATE
# =========================================

def create_initial_state():

    print("🌴 KonkanXplore")
    print("========================")

    budget = int(
        input("Enter your budget (₹): ")
    )

    duration = int(
        input("Enter trip duration (days): ")
    )

    group_size = int(
        input("Enter number of people: ")
    )

    traveler_type = input(
        "Enter traveler type (family/couple/friends/solo): "
    ).strip().lower()

    interests_input = input(
        "Enter interests (beach, food, adventure, nature): "
    )

    interests = [
        item.strip().lower()
        for item in interests_input.split(",")
    ]

    walking_level = input(
        "Enter walking level (low/moderate/high): "
    ).strip().lower()

    return {

        "budget": budget,

        "destination": "",

        "duration_days": duration,

        "group_size": group_size,

        "traveler_type": traveler_type,

        "interests": interests,

        "walking_level": walking_level,

        "profile": {},

        "activities": [],

        "planned_activities": [],

        "budget_result": {},

        "critic_result": {},

        "revision_count": 0
    }


# =========================================
# CREATE LANGGRAPH
# =========================================

graph = StateGraph(
    TravelState
)


# =========================================
# ADD NODES
# =========================================

graph.add_node(
    "profile",
    profile_node
)

graph.add_node(
    "activity",
    activity_node
)

graph.add_node(
    "planner",
    planner_node
)

graph.add_node(
    "budget",
    budget_node
)

graph.add_node(
    "critic",
    critic_node
)

graph.add_node(
    "revision",
    revision_node
)


# =========================================
# NORMAL FLOW
# =========================================

graph.add_edge(
    START,
    "profile"
)

graph.add_edge(
    "profile",
    "activity"
)

graph.add_edge(
    "activity",
    "planner"
)

graph.add_edge(
    "planner",
    "budget"
)

graph.add_edge(
    "budget",
    "critic"
)


# =========================================
# CRITIC DECISION
# =========================================

graph.add_conditional_edges(
    "critic",
    critic_router,
    {
        "revise": "revision",
        "finish": END
    }
)


# =========================================
# REVISION → PLANNER
# =========================================

graph.add_edge(
    "revision",
    "planner"
)


# =========================================
# COMPILE
# =========================================

app = graph.compile()


# =========================================
# RUN KONKANXPLORE
# =========================================

if __name__ == "__main__":

    state = create_initial_state()

    print(
        "\n🚀 Starting "
        "KonkanXplore Agent Workflow..."
    )

    final_state = app.invoke(
        state
    )

    print("\n========================")
    print("🌴 WORKFLOW COMPLETED")
    print("========================")


    # =====================================
    # PROFILE
    # =====================================

    print("\n🧳 Traveler Profile:")

    print(
        final_state["profile"]
    )


    # =====================================
    # CANDIDATES
    # =====================================

    print(
        f"\n🎯 Candidate Activities Found: "
        f"{len(final_state['activities'])}"
    )

    for i, activity in enumerate(
        final_state["activities"],
        start=1
    ):

        print(
            f"{i}. {activity['name']}"
        )


    # =====================================
    # FINAL PLAN
    # =====================================

    print(
        f"\n🧠 Final Planned Activities: "
        f"{len(final_state['planned_activities'])}"
    )

    for i, activity in enumerate(
        final_state["planned_activities"],
        start=1
    ):

        print(
            f"{i}. {activity['name']}"
        )


    # =====================================
    # REVISIONS
    # =====================================

    print(
        f"\n🔄 Planner Revisions: "
        f"{final_state['revision_count']}"
    )


    # =====================================
    # BUDGET
    # =====================================

    print("\n💰 Budget Summary:")

    budget_result = (
        final_state["budget_result"]
    )

    print(
        f"Total Budget: "
        f"₹{budget_result['total_budget']}"
    )

    print(
        f"Accommodation: "
        f"₹{budget_result['accommodation']}"
    )

    print(
        f"Food: "
        f"₹{budget_result['food']}"
    )

    print(
        f"Activities: "
        f"₹{budget_result['activities']}"
    )

    print(
        f"Transport: "
        f"₹{budget_result['transport']}"
    )

    print(
        f"Total Expense: "
        f"₹{budget_result['total_expense']}"
    )

    print(
        f"Remaining Budget: "
        f"₹{budget_result['remaining_budget']}"
    )


    # =====================================
    # CRITIC
    # =====================================

    print("\n🔍 Critic Review:")

    critic = (
        final_state["critic_result"]
    )

    print(
        f"Status: "
        f"{critic['status']}"
    )

    if critic["issues"]:

        print("\n⚠️ Issues:")

        for issue in critic["issues"]:

            print(
                f"- {issue}"
            )

    else:

        print(
            "✅ No major issues found!"
        )


    # =====================================
    # SUGGESTIONS
    # =====================================

    print("\n💡 Suggestions:")

    for suggestion in critic[
        "suggestions"
    ]:

        print(
            f"- {suggestion}"
        )
