const domains = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
];

export function generateEmailAddresses(firstName: string, lastName: string) {
  const formats = [
    `${firstName}${lastName}`,
    `${firstName}.${lastName}`,
    `${firstName}_${lastName}`,
    `${firstName}-${lastName}`,
    `${lastName}${firstName}`,
    `${lastName}.${firstName}`,
    `${lastName}_${firstName}`,
    `${lastName}-${firstName}`,
    `${firstName}${lastName[0]}`,
    `${firstName[0]}${lastName}`,
    `${firstName}.${lastName[0]}`,
    `${firstName[0]}.${lastName}`,
    `${firstName}_${lastName[0]}`,
    `${firstName[0]}_${lastName}`,
    `${firstName}-${lastName[0]}`,
    `${firstName[0]}-${lastName}`,
  ];

  const emailAddresses = [];

  for (const domain of domains) {
    for (const format of formats) {
      emailAddresses.push(`${format}@${domain}`);
    }
  }

  return emailAddresses;
}
