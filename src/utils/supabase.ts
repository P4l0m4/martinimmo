// import { createClient } from "@supabase/supabase-js";
// const config = useRuntimeConfig();
// const supabaseUrl = config.public.SUPABASE_URL;
// const supabaseKey = config.public.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

import type { Member } from "~/components/FamilyMember.vue";

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

export async function addFamillyMemberInfoToDB(
  user_id: string,
  member: Member,
  savedMembers: Member[]
) {
  try {
    //check if member already exists
    const memberExists = savedMembers.some(
      (m: Member) => m.email === member.email
    );
    if (memberExists) {
      return false;
    }

    const membersToAddToDB = [...new Set(savedMembers), member];

    const { data, error } = await supabase
      .from("users")
      .update({ saved_contacts: membersToAddToDB })
      .eq("user_id", user_id)
      .select();

    if (error) {
      console.error("Error inserting saved_contacts data:", error);
      return [];
    }
    return data[0]?.saved_contacts || [];
  } catch (error) {
    console.error("Error fetching or updating family member info:", error);
  }
}

export async function fetchFamillyMemberInfoFromDB(user_id: string) {
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

export async function removeFamillyMemberInfoFromDB(
  user_id: string,
  member: Member,
  savedMembers: Member[]
) {
  try {
    // Remove the member with the given email
    const updatedMembers = savedMembers.filter(
      (m: Member) => m.email !== member.email
    );

    const { data, error } = await supabase
      .from("users")
      .update({ saved_contacts: updatedMembers })
      .eq("user_id", user_id)
      .select();

    if (error) {
      console.error("Error removing member from saved_contacts data:", error);
      return [];
    }
    return data[0]?.saved_contacts || [];
  } catch (error) {
    console.error("Error fetching or updating family member info:", error);
  }
}

export async function deleteAllSavedContacts(user_id: string) {
  const { data, error } = await supabase
    .from("users")
    .update({ saved_contacts: [] })
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("Error deleting data:", error);
  } else {
    location.reload();
  }
}
