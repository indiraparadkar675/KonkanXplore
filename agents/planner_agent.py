def plan_activities(
    activities,
    budget,
    duration_days,
    group_size,
    traveler_type,
    interests,
    walking_level
):
    """
    Planner Agent

    Selects a small, realistic set of activities
    from the activities recommended by Activity Agent.
    """

    if not activities:
        return []

    if isinstance(interests, str):
        interests = [interests]

    interests = [
        str(item).lower().strip()
        for item in interests
    ]

    traveler_type = traveler_type.lower().strip()
    walking_level = walking_level.lower().strip()

    scored_activities = []

    for activity in activities:

        score = 0

        # -----------------------------
        # 1. Interest matching
        # -----------------------------

        activity_interests = [
            str(item).lower().strip()
            for item in activity.get("interests", [])
        ]

        tags = [
            str(item).lower().strip()
            for item in activity.get("tags", [])
        ]

        for interest in interests:

            if interest in activity_interests:
                score += 5

            elif interest in tags:
                score += 3

            elif interest == "beach":
                beach_related = [
                    "water_sports",
                    "marine_life",
                    "nature",
                    "sea",
                    "photography"
                ]

                if any(
                    item in activity_interests
                    for item in beach_related
                ):
                    score += 2

        # -----------------------------
        # 2. Traveler type
        # -----------------------------

        suitable_for = [
            str(item).lower().strip()
            for item in activity.get("suitable_for", [])
        ]

        if traveler_type in suitable_for:
            score += 4

        # -----------------------------
        # 3. Walking preference
        # -----------------------------

        activity_walking = activity.get(
            "walking_required",
            "low"
        ).lower()

        if walking_level == "low":

            if activity_walking == "low":
                score += 3

            elif activity_walking == "moderate":
                score += 1

        elif walking_level == "moderate":

            if activity_walking in ["low", "moderate"]:
                score += 2

        elif walking_level == "high":

            score += 2

        # -----------------------------
        # 4. Cost preference
        # -----------------------------

        cost = activity.get(
            "estimated_cost_inr",
            {}
        )

        if isinstance(cost, dict):
            minimum_cost = cost.get("min", 0)
        else:
            minimum_cost = cost

        # Prefer lower-cost activities
        if minimum_cost <= 500:
            score += 2

        elif minimum_cost <= 1000:
            score += 1

        scored_activities.append(
            {
                "activity": activity,
                "score": score,
                "cost": minimum_cost
            }
        )

    # -----------------------------
    # Sort by highest score
    # -----------------------------

    scored_activities.sort(
        key=lambda item: (
            -item["score"],
            item["cost"]
        )
    )

    # -----------------------------
    # Decide realistic activity count
    # -----------------------------

    if duration_days <= 1:
        max_activities = 2

    elif duration_days == 2:
        max_activities = 4

    elif duration_days == 3:
        max_activities = 5

    else:
        max_activities = min(
            duration_days * 2,
            8
        )

    # -----------------------------
    # Select activities
    # -----------------------------

    selected = []

    total_activity_cost = 0

    # Use a reasonable portion of the total budget
    activity_budget = int(budget * 0.30)

    for item in scored_activities:

        activity = item["activity"]
        cost = item["cost"]

        if len(selected) >= max_activities:
            break

        # Try to stay within activity budget
        if (
            total_activity_cost + cost
            <= activity_budget
        ):
            selected.append(activity)
            total_activity_cost += cost

    # -----------------------------
    # Fallback
    # -----------------------------

    return selected


def display_plan(activities):

    print("\n🧠 Planner Agent - Final Activity Plan")
    print("----------------------------------------")

    if not activities:

        print("No activities selected.")

        return

    total_cost = 0

    for i, activity in enumerate(
        activities,
        start=1
    ):

        cost = activity.get(
            "estimated_cost_inr",
            {}
        )

        if isinstance(cost, dict):
            minimum_cost = cost.get("min", 0)
            maximum_cost = cost.get("max", 0)

            total_cost += minimum_cost

            cost_text = (
                f"₹{minimum_cost} - "
                f"₹{maximum_cost}"
            )

        else:

            total_cost += cost
            cost_text = f"₹{cost}"

        print(
            f"{i}. {activity['name']}"
        )

        print(
            f"   Location: "
            f"{', '.join(activity['location'])}"
        )

        print(
            f"   Cost: {cost_text}"
        )

        print(
            f"   Duration: "
            f"{activity['duration_minutes']} minutes"
        )

    print("----------------------------------------")

    print(
        f"Estimated minimum activity cost: "
        f"₹{total_cost}"
    )


if __name__ == "__main__":

    print("🌴 KonkanXplore - Planner Agent")

    # Simple standalone test
    activities = [
        {
            "name": "Boat Ride",
            "location": ["Malvan"],
            "interests": [
                "nature",
                "sea",
                "photography",
                "relaxation"
            ],
            "suitable_for": [
                "families",
                "couples",
                "elderly_travelers",
                "groups"
            ],
            "walking_required": "low",
            "estimated_cost_inr": {
                "min": 300,
                "max": 1500
            },
            "duration_minutes": 60
        }
    ]

    selected = plan_activities(
        activities=activities,
        budget=5000,
        duration_days=2,
        group_size=2,
        traveler_type="couple",
        interests=["beach"],
        walking_level="low"
    )

    display_plan(selected)
