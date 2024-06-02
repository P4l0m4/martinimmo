import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ddjxlmqtddwruodawjnx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkanhsbXF0ZGR3cnVvZGF3am54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTczMzkxMjgsImV4cCI6MjAzMjkxNTEyOH0.SpAXPR_f3_rdjyR3CwVIDQWSERXt-teZvjqn_4FWMJ0";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function addUser(firstname, lastname, family) {
  const { data, error } = await supabase.from("persons").insert([
    {
      firstname,
      lastname,
      family,
    },
  ]);

  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log("Data inserted successfully:", data);
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
