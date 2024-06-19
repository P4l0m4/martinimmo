// import { createClient } from "@supabase/supabase-js";
// const config = useRuntimeConfig();
// const supabaseUrl = config.public.SUPABASE_URL;
// const supabaseKey = config.public.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

let supabase: any;

export function initSupabase(s: any) {
  supabase = s;
}

export async function addUser(
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
