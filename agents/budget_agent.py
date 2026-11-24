def calculate_budget(
    total_budget,
    accommodation_cost,
    food_cost,
    activity_cost,
    transport_cost
):
    """Calculate total trip cost and remaining budget."""

    total_expense = (
        accommodation_cost
        + food_cost
        + activity_cost
        + transport_cost
    )

    remaining_budget = total_budget - total_expense

    return {
        "total_budget": total_budget,
        "accommodation": accommodation_cost,
        "food": food_cost,
        "activities": activity_cost,
        "transport": transport_cost,
        "total_expense": total_expense,
        "remaining_budget": remaining_budget
    }


def display_budget(result):
    """Display the budget breakdown."""

    print("\n💰 Budget Analysis")
    print("-------------------------")

    print(f"Total Budget: ₹{result['total_budget']}")
    print(f"Accommodation: ₹{result['accommodation']}")
    print(f"Food: ₹{result['food']}")
    print(f"Activities: ₹{result['activities']}")
    print(f"Transport: ₹{result['transport']}")

    print("-------------------------")

    print(f"Total Expense: ₹{result['total_expense']}")

    if result["remaining_budget"] >= 0:
        print(
            f"Remaining Budget: "
            f"₹{result['remaining_budget']}"
        )
        print("✅ Trip is within budget!")
    else:
        print(
            f"Budget Exceeded By: "
            f"₹{abs(result['remaining_budget'])}"
        )
        print("⚠️ Trip exceeds the budget.")


if __name__ == "__main__":

    print("🌴 KonkanXplore - Budget Agent")

    total_budget = int(
        input("Enter total trip budget (₹): ")
    )

    accommodation = int(
        input("Enter accommodation cost (₹): ")
    )

    food = int(
        input("Enter food cost (₹): ")
    )

    activities = int(
        input("Enter activities cost (₹): ")
    )

    transport = int(
        input("Enter transport cost (₹): ")
    )

    result = calculate_budget(
        total_budget,
        accommodation,
        food,
        activities,
        transport
    )

    display_budget(result)