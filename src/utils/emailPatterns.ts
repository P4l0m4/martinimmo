const domains = ["gmail.com", "yahoo.com", "hotmail.com"];

export function generateEmailAddresses(firstName: string, lastName: string) {
  const firstNameArray = firstName.split(" ");
  const primaryFirstName = firstNameArray[0];

  const formats = [
    `${primaryFirstName}${lastName}`,
    `${primaryFirstName}.${lastName}`,
    `${primaryFirstName}_${lastName}`,
    `${primaryFirstName}-${lastName}`,
    `${lastName}${primaryFirstName}`,
    `${lastName}.${primaryFirstName}`,
    `${lastName}_${primaryFirstName}`,
    `${lastName}-${primaryFirstName}`,
    `${primaryFirstName}${lastName[0]}`,
    `${primaryFirstName[0]}${lastName}`,
    `${primaryFirstName}.${lastName[0]}`,
    `${primaryFirstName[0]}.${lastName}`,
    `${primaryFirstName}_${lastName[0]}`,
    `${primaryFirstName[0]}_${lastName}`,
    `${primaryFirstName}-${lastName[0]}`,
    `${primaryFirstName[0]}-${lastName}`,
  ];

  const emailAddresses = [];

  for (const domain of domains) {
    for (const format of formats) {
      emailAddresses.push(`${format}@${domain}`);
    }
  }

  return emailAddresses;
}
