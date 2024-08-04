export function removeMatchingNames(
  personsList: { first_name: string; last_name: string }[],
  givenFirstNames: string,
  givenLastName: string
) {
  const givenFirstNamesArray = givenFirstNames.split(" ");

  return personsList.filter((person) => {
    const personFirstNamesArray = person.first_name.split(" ");

    const hasMatchingFirstName = givenFirstNamesArray.some((firstName) =>
      personFirstNamesArray.includes(firstName)
    );

    return !(hasMatchingFirstName && person.last_name === givenLastName);
  });
}
