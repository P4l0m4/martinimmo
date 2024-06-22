// import { createClient } from "@supabase/supabase-js";
// const config = useRuntimeConfig();
// const supabaseUrl = config.public.SUPABASE_URL;
// const supabaseKey = config.public.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

let supabase: any;

export function initSupabase(s: any) {
  supabase = s;
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
    console.log("User already exists. Skipping insert.");
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
  } else {
    console.log("Invitation sent successfully!");
  }
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
  if (token) {
    const { data, error } = await supabase.auth.getUser(token.access_token);
    if (error) {
      console.error("Invalid token", error);

      return;
    } else {
      // console.log("Valid token", data);
      return data;
    }
  }
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
    console.log("adding user to db", defaultCredits);
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
    }
  }
}

let membersToAddToDB: any = [];

export async function addFamillyMemberInfoToDB(user_id: string, member: any) {
  try {
    const data = await fetchFamillyMemberInfoFromDB(user_id);

    let currentMembers = Array.isArray(data[0]?.unlocked_info)
      ? data[0].unlocked_info
      : [];

    // Use a Set to ensure unique members
    const memberSet = new Set(
      currentMembers.map((m: any) => JSON.stringify(m))
    );
    memberSet.add(JSON.stringify(member));

    // Convert the set back to an array of objects
    membersToAddToDB = Array.from(memberSet).map((m: any) => JSON.parse(m));

    const { data: updateData, error } = await supabase
      .from("users")
      .update({ unlocked_info: membersToAddToDB })
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error inserting unlocked info data:", error);
    }
    // else {
    //   console.log("User updated successfully:", membersToAddToDB);
    // }
  } catch (error) {
    console.error("Error fetching or updating family member info:", error);
  }
}

export async function fetchFamillyMemberInfoFromDB(user_id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("unlocked_info")
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  } else {
    return data;
  }
}

export async function removeFamillyMemberInfoFromDB(
  user_id: string,
  email: string
) {
  try {
    const data = await fetchFamillyMemberInfoFromDB(user_id);

    let currentMembers = Array.isArray(data[0]?.unlocked_info)
      ? data[0].unlocked_info
      : [];

    // Remove the member with the given email
    const updatedMembers = currentMembers.filter(
      (member: any) => member.email !== email
    );

    const { data: updateData, error } = await supabase
      .from("users")
      .update({ unlocked_info: updatedMembers })
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error removing member from unlocked info data:", error);
    } else {
      location.reload();
    }
  } catch (error) {
    console.error("Error fetching or updating family member info:", error);
  }
}

export async function deleteAllUnlockedInfo(user_id: string) {
  const { data, error } = await supabase
    .from("users")
    .update({ unlocked_info: [] })
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("Error deleting data:", error);
  } else {
    location.reload();
  }
}
