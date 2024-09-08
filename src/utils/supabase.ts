import { useAccountStore } from "@/stores/accountStore";
import type { FamilyMember, DeadPerson } from "@/components/FamilyMember.vue";
let accountStore: any;
export default {
  asyncData({ $pinia }) {
    accountStore = useAccountStore($pinia);
  },
};

let supabase: any;

export function initSupabase(s: any) {
  supabase = s;
}

export async function fetchAllDeadPeople() {
  const { data, error } = await supabase
    .from("dead_people_list")
    .select("*")
    .not("unlocked", "eq", true);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function fetchDeadPeopleByRegion(region: string) {
  const { data, error } = await supabase
    .from("dead_people_list")
    .select("*")
    .eq("current_death_reg_name", region)
    .not("unlocked", "eq", true);
  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function fetchDeadPeopleByDepartment(department: string) {
  const { data, error } = await supabase
    .from("dead_people_list")
    .select("*")
    .eq("current_death_dep_name", department)
    .not("unlocked", "eq", true);
  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function fetchDeadPeopleByCity(city: string) {
  const { data, error } = await supabase
    .from("dead_people_list")
    .select("*")
    .eq("current_death_com_name", city)
    .not("unlocked", "eq", true);
  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function fetchCitiesList(department: string) {
  const { data, error } = await supabase
    .from("departments_and_cities")
    .select("*")
    .eq("department_name", department);
  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function fetchDeadPersonById(id: string) {
  const { data, error } = await supabase
    .from("dead_people_list")
    .select("*")
    .eq("id", id);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function addPerson(
  firstname: string,
  lastname: string,
  family: any
) {
  const { data: existingUsers, error: fetchError } = await supabase
    .from("persons")
    .select("*")
    .eq("firstname", firstname)
    .eq("lastname", lastname);

  if (fetchError) {
    console.error("Error checking for existing user:", fetchError);
    return;
  }

  if (existingUsers && existingUsers.length > 0) {
    console.log("User already exists. Skipping insert.", existingUsers);

    return;
  }

  // Insert the new user
  const { data, error } = await supabase.from("persons").insert([
    {
      firstname,
      lastname,
      family,
    },
  ]);

  if (error) {
    console.error("Error inserting data:", error);
  }
}

export async function fetchPersons() {
  const { data, error } = await supabase.from("persons").select("*");

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function sendInvitation(
  email: string,
  password: string,
  accountType: string
) {
  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        accountType: accountType,
      },
    },
  });

  if (error) {
    if (error.message.includes("user")) {
      throw new Error("Cet email est déjà utilisé.");
    } else {
      throw new Error("Error sending invitation: " + error.message);
    }
  }
  // else {
  //   console.log("Invitation sent successfully!");
  // }
}

export async function authenticateUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Error signing in:", error);
    throw new Error("Authentication failed: " + error.message);
  } else {
    // console.log("Authentication successful!", data);

    window.location.href = "/recherche";
    return data;
  }
}

export async function checkExistingToken() {
  const token = localStorage.getItem("sb-ddjxlmqtddwruodawjnx-auth-token");
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token.access_token);
  if (error) return null;

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
  } else {
    // console.log("Sign out successful!");

    window.location.reload();

    return;
  }
}

export async function addUser(user_id: string, last_credit_update: any) {
  const { data: existingUsers, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (fetchError) {
    // console.error("Error checking for existing user:", fetchError);
    const isUserLoggedIn = await checkExistingToken();
    //check account type
    const accountType = await isUserLoggedIn.user.user_metadata.accountType;
    let defaultCredits;

    if (accountType === "gratuit") {
      defaultCredits = 10;
    } else if (accountType === "premium") {
      defaultCredits = 100;
    }

    const { data, error } = await supabase.from("users").insert([
      {
        user_id,
        last_credit_update,
        credits: defaultCredits,
      },
    ]);
    if (error) {
      console.error("Error inserting data:", error);
    }
    return;
  } else if (existingUsers && existingUsers.length > 0) {
    return;
  }
}

export async function fetchUserById(user_id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("")
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function updateUser(user_id: string, creditsToAdd: number) {
  const { data, error } = await supabase
    .from("users")
    .update({ credits: creditsToAdd })
    .eq("user_id", user_id);

  if (error) {
    console.error("Error updating data:", error);
  }
}

export async function getCredits(user_id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("credits")
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function removeOneCredit(user_id: string) {
  let user = await fetchUserById(user_id);

  const newCredits = user.credits - 1;
  if (newCredits <= 0) {
    console.error("Not enough credits to remove one.");
    return;
  } else {
    const { data, error: updateError } = await supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("user_id", user_id)
      .single();

    if (updateError) {
      console.error("Error updating data:", updateError.message);
    } else {
      // console.log("User updated successfully:", data);
      location.reload();
    }
  }
}

export async function removeCredits(user_id: string, creditsToRemove: number) {
  let credits = await getCredits(user_id);

  const newCredits = credits.credits - creditsToRemove;

  if (newCredits <= 0) {
    console.error("Not enough credits to remove one.");
    return;
  } else {
    for (let i = 0; i < creditsToRemove; i++) {
      const { data, error: updateError } = await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("user_id", user_id)
        .single();

      if (updateError) {
        console.error("Error updating data:", updateError.message);
      }
    }
  }
}

export async function addCredits(user_id: string, creditsToAdd: number) {
  let user = await fetchUserById(user_id);

  const newCredits = user.credits + creditsToAdd;
  const { data, error: updateError } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("user_id", user_id)
    .single();

  if (updateError) {
    console.error("Error updating data:", updateError.message);
  } else {
    // console.log("User updated successfully:", data);
    location.reload();
  }
}

export async function addDeadPersonInfoToDB(
  user_id: string,
  selectedPersons: DeadPerson[]
) {
  const savedPeople = await fetchDeadPersonInfoFromDB(user_id);

  const membersToAddToDB = [...new Set([...savedPeople, ...selectedPersons])];

  const { data, error } = await supabase
    .from("users")
    .update({ saved_contacts: membersToAddToDB })
    .eq("user_id", user_id)
    .select();

  if (error) {
    console.error("Error inserting saved_contacts data:", error);
    return [];
  }
}

export async function fetchDeadPersonInfoFromDB(user_id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("saved_contacts")
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }
  return data[0]?.saved_contacts || [];
}

export async function deleteAllSavedContactsAndFamilyMembers(user_id: string) {
  const { data, error } = await supabase
    .from("users")
    .update({ saved_contacts: [] })
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("Error deleting data:", error);
  } else {
    const { data, error } = await supabase
      .from("family_from_unlocked_persons")
      .select("*")
      .eq("user_id", user_id)
      .delete();

    if (error) {
      console.error("Error deleting family members:", error);
    } else {
      location.reload();
    }
  }
}

export async function deleteSavedContactByID(user_id: string, id: string) {
  const savedPeople = await fetchDeadPersonInfoFromDB(user_id);
  const updatedSavedPeople = savedPeople.filter(
    (person: any) => person.id !== id
  );
  const { data, error } = await supabase
    .from("users")
    .update({ saved_contacts: updatedSavedPeople })
    .eq("user_id", user_id);

  if (error) {
    console.error("Error deleting data:", error);
  } else {
    const { data2, error2 } = await supabase
      .from("family_from_unlocked_persons")
      .delete()
      .eq("id_from_deceased", id);

    if (error2) {
      console.error("Error deleting family members:", error);
    } else {
      location.reload();
    }
  }
}

export async function getAllFamilyFromDB(
  user_id: string
): Promise<FamilyMember[]> {
  let idsArray: string[];
  const deadPersonsFromDB = await fetchDeadPersonInfoFromDB(user_id);

  idsArray = deadPersonsFromDB.map((person: any) => person.id);

  let familyFromDB: FamilyMember[] = [];

  const familyPromises = idsArray.map(async (id: string) => {
    const { data, error } = await supabase
      .from("family_from_unlocked_persons")
      .select("*")
      .eq("id_from_deceased", id);

    if (error) {
      console.error("Error fetching data:", error);
      return [];
    }
    return data || [];
  });

  const familyDataArrays = await Promise.all(familyPromises);

  familyFromDB = familyDataArrays.flat();

  return familyFromDB;
}

export async function addFamillyToDB(familyMember: FamilyMember) {
  try {
    const { data, error } = await supabase
      .from("family_from_unlocked_persons")
      .insert([
        {
          firstnames: familyMember.first_name,
          lastname: familyMember.last_name,
          email: familyMember.email,
          id_from_deceased: familyMember.id_from_deceased,
        },
      ]);

    if (error) {
      throw error; // This will be caught by the catch block
    }

    console.log("Family member added successfully to DB!", data);
  } catch (error) {
    console.error("Error adding family member to DB:", error);
  }
}

export async function getFamillyByDeceasedId(deceasedId: string) {
  const { data, error } = await supabase
    .from("family_from_unlocked_persons")
    .select("*")
    .eq("id_from_deceased", deceasedId);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    console.log("Family members fetched successfully!", data);
    return data;
  }
}

export async function checkIfFamilyMemberExists(email: string) {
  const { data, error } = await supabase
    .from("family_from_unlocked_persons")
    .select("*")
    .eq("email", email);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function updateUnlockedStatusOfDeceasedPerson(deceasedId: string) {
  const { data, error } = await supabase
    .from("dead_people_list")
    .update({ unlocked: true })
    .eq("id", deceasedId);

  if (error) {
    console.error("Error updating data:", error);
  } else {
    console.log("Deceased person unlocked successfully!");
  }
}

export async function generateUser() {
  const isUserLoggedIn = await checkExistingToken();
  const currentDate = new Date();
  const dateISOString = currentDate.toISOString();
  let user;
  if (isUserLoggedIn.value.user.id) {
    addUser(isUserLoggedIn.value.user.id, dateISOString);
    user = await fetchUserById(isUserLoggedIn.value.user.id);
    accountStore.updateLastCreditUpdate(user.last_credit_update);
  } else {
    console.log("No user logged in");
  }
}
