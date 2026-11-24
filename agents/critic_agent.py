def evaluate_plan(
    total_budget,
    total_cost,
    duration_days,
    activities_count,
    walking_level,
    activity_levels
):
    """
    Evaluate a travel plan and identify possible problems.
    """

    issues = []
    suggestions = []

    # Budget check
    if total_cost > total_budget:
        issues.append(
            f"Budget exceeded by ₹{total_cost - total_budget}"
        )
        suggestions.append(
            "Reduce accommodation, food, activity or transport costs."
        )

    else:
        suggestions.append(
            "Trip is within the planned budget."
        )

    # Activity count check
    if activities_count > duration_days * 4:
        issues.append(
            "Too many activities are planned for the trip duration."
        )
        suggestions.append(
            "Reduce the number of activities to make the itinerary realistic."
        )

    # Walking check
    if walking_level.lower() == "low":

        high_walking_count = sum(
            1
            for level in activity_levels
            if level.lower() == "high"
        )

        if high_walking_count > 0:
            issues.append(
                "Some activities may require high walking effort."
            )
            suggestions.append(
                "Replace high-walking activities with easier alternatives."
            )

    # General activity check
    if activities_count == 0:
        issues.append(
            "No activities are included in the itinerary."
        )
        suggestions.append(
            "Add suitable activities based on traveler interests."
        )

    # Final result
    if len(issues) == 0:
        status = "APPROVED"
    else:
        status = "NEEDS_REVISION"

    return {
        "status": status,
        "issues": issues,
        "suggestions": suggestions
    }


def display_review(review):
    """Display critic agent results."""

    print("\n🔍 Critic Agent Review")
    print("-------------------------")

    print(f"Status: {review['status']}")

    if review["issues"]:

        print("\n⚠️ Issues Found:")

        for issue in review["issues"]:
            print(f"- {issue}")

    else:

        print("\n✅ No major issues found.")

    print("\n💡 Suggestions:")

    for suggestion in review["suggestions"]:
        print(f"- {suggestion}")


if __name__ == "__main__":

    print("🌴 KonkanXplore - Critic Agent")

    total_budget = int(
        input("Enter total budget (₹): ")
    )

    total_cost = int(
        input("Enter estimated total cost (₹): ")
    )

    duration_days = int(
        input("Enter trip duration (days): ")
    )

    activities_count = int(
        input("Enter number of activities: ")
    )

    walking_level = input(
        "Enter traveler walking level (low/moderate/high): "
    )

    levels_input = input(
        "Enter activity walking levels separated by commas: "
    )

    activity_levels = [
        level.strip()
        for level in levels_input.split(",")
    ]

    review = evaluate_plan(
        total_budget=total_budget,
        total_cost=total_cost,
        duration_days=duration_days,
        activities_count=activities_count,
        walking_level=walking_level,
        activity_levels=activity_levels
    )

    display_review(review)