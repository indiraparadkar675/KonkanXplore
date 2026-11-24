def create_profile(
    budget,
    duration_days,
    group_size,
    traveler_type,
    interests,
    walking_level="low"
):
    """
    Create a structured traveler profile for KonkanXplore.
    """

    profile = {
        "budget_inr": budget,
        "duration_days": duration_days,
        "group_size": group_size,
        "traveler_type": traveler_type,
        "interests": interests,
        "walking_level": walking_level
    }

    return profile


def display_profile(profile):
    """Display the traveler profile."""

    print("\n🧳 Traveler Profile")
    print("-------------------------")

    print(f"Budget: ₹{profile['budget_inr']}")
    print(f"Duration: {profile['duration_days']} days")
    print(f"Group Size: {profile['group_size']}")
    print(f"Traveler Type: {profile['traveler_type']}")
    print(f"Interests: {', '.join(profile['interests'])}")
    print(f"Walking Level: {profile['walking_level']}")


if __name__ == "__main__":

    print("🌴 KonkanXplore - Profile Agent")

    budget = int(input("Enter your budget (₹): "))
    duration = int(input("Enter trip duration (days): "))
    group_size = int(input("Enter number of people: "))

    traveler_type = input(
        "Enter traveler type (family/couple/friends/solo): "
    )

    interests_input = input(
        "Enter interests (beach, food, adventure, nature): "
    )

    interests = [
        interest.strip()
        for interest in interests_input.split(",")
    ]

    walking_level = input(
        "Enter walking level (low/moderate/high): "
    )

    profile = create_profile(
        budget=budget,
        duration_days=duration,
        group_size=group_size,
        traveler_type=traveler_type,
        interests=interests,
        walking_level=walking_level
    )

    display_profile(profile)