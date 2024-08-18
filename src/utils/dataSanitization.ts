import { normalizeString } from "@/utils/normalize";

export function removeMatchingNames(
  personsList: { first_name: string; last_name: string }[],
  givenFirstNames: string,
  givenLastName: string
) {
  const givenFirstNamesArray = givenFirstNames
    .toLowerCase()
    .split(" ")
    .map((name) => normalizeString(name.trim()));

  const normalizedGivenLastName = normalizeString(givenLastName.trim());

  return personsList.filter((person) => {
    const personFirstNamesArray = normalizeString(person.first_name)
      .split(" ")
      .map((name: string) => normalizeString(name.trim()));

    const normalizedPersonLastName = normalizeString(person.last_name.trim());

    const hasMatchingFirstName = givenFirstNamesArray.some((firstName) =>
      personFirstNamesArray.includes(normalizeString(firstName))
    );

    const isLastNameMatching =
      normalizedPersonLastName === normalizedGivenLastName;

    // Only exclude the person if both the first name and last name match exactly
    return !(hasMatchingFirstName && isLastNameMatching);
  });
}
