import json

DATA_FILE = "data/activities.json"


def load_activities():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def find_activities(interests, traveler_type, budget):
    activities = load_activities()

    results = []

    # Convert input into a clean list
    if isinstance(interests, str):
        interests = [interests]

    interests = [
        str(x).lower().strip()
        for x in interests
    ]

    traveler_type = traveler_type.lower().strip()

    for activity in activities:

        activity_interests = [
            str(x).lower().strip()
            for x in activity.get("interests", [])
        ]

        tags = [
            str(x).lower().strip()
            for x in activity.get("tags", [])
        ]

        suitable_for = [
            str(x).lower().strip()
            for x in activity.get("suitable_for", [])
        ]

        # Check interest match
        interest_matches = False

        for interest in interests:

            if interest in activity_interests:
                interest_matches = True

            elif interest in tags:
                interest_matches = True

            # Beach means coastal / water-related activities
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
                    interest_matches = True

        if not interest_matches:
            continue

        # Traveler preference
        if traveler_type in suitable_for:
            traveler_score = 1
        else:
            traveler_score = 0

        # Cost
        cost = activity.get(
            "estimated_cost_inr",
            {}
        )

        minimum_cost = cost.get("min", 0)

        # Remove activities whose minimum cost
        # is greater than the available budget
        if minimum_cost > budget:
            continue

        results.append(
            {
                "activity": activity,
                "score": traveler_score
            }
        )

    # Family/couple/etc. suitable activities first
    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results


def display_results(results):

    print("\n🎯 Recommended Activities")
    print("-------------------------")

    if len(results) == 0:
        print("No matching activities found.")
        return

    for i, result in enumerate(results, 1):

        activity = result["activity"]

        cost = activity["estimated_cost_inr"]

        print(
            f"\n{i}. {activity['name']}"
        )

        print(
            "Location:",
            ", ".join(activity["location"])
        )

        print(
            "Cost:",
            f"₹{cost['min']} - ₹{cost['max']}"
        )

        print(
            "Duration:",
            f"{activity['duration_minutes']} minutes"
        )

        print(
            "Difficulty:",
            activity["difficulty"]
        )

        print(
            "Suitable for:",
            ", ".join(activity["suitable_for"])
        )


if __name__ == "__main__":

    print("🌴 KonkanXplore - Activity Agent")

    interest = input(
        "Enter interest (beach/food/adventure/nature): "
    ).strip().lower()

    traveler_type = input(
        "Enter traveler type (family/couple/friends/solo): "
    ).strip().lower()

    budget = int(
        input("Enter activity budget (₹): ")
    )

    results = find_activities(
        [interest],
        traveler_type,
        budget
    )

    display_results(results)