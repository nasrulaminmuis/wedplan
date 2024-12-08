import { config } from 'dotenv';  // Import dotenv to load environment variables
config();  // Load the .env file

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your URL and key
const supabaseUrl = 'https://uikfsdqpjarcmazypmns.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create Data
async function createData(tableName, data) {
  const { data: insertedData, error } = await supabase
    .from(tableName)
    .insert([data]);  // Insert data (wrap in array for single insert)

  if (error) {
    console.error('Error inserting data:', error);
    return null;
  }

  console.log('Data inserted:', insertedData);
  return insertedData;
}

// Read Data
async function readData(tableName, filters = {}) {
  const { data, error } = await supabase
    .from(tableName)
    .select()
    .match(filters);  // Apply filters if provided

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  console.log('Fetched data:', data);
  return data;
}

// Update Data
async function updateData(tableName, id, updateFields) {
  const { data, error } = await supabase
    .from(tableName)
    .update(updateFields)
    .eq('id', id);  // Assuming 'id' is the primary key

  if (error) {
    console.error('Error updating data:', error);
    return null;
  }

  console.log('Updated data:', data);
  return data;
}

// Delete Data
async function deleteData(tableName, id) {
  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);  // Assuming 'id' is the primary key

  if (error) {
    console.error('Error deleting data:', error);
    return null;
  }

  console.log('Deleted data:', data);
  return data;
}

// Example Usage
async function exampleUsage() {
  // Create a new user
  const newUser = await createData('users', {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'securepassword',
  });

  // Read all users (or apply filters)
  const users = await readData('users');

  // Update a user's email
  if (users && users.length > 0) {
    const updatedUser = await updateData('users', users[0].id, {
      email: 'john_new@example.com',
    });
  }

  // Delete a user (use an existing user's ID)
  if (users && users.length > 0) {
    const deletedUser = await deleteData('users', users[0].id);
  }
}


