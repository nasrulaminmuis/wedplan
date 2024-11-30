-- Table structure for table `users`
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  partner_name VARCHAR(100) DEFAULT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `vendors`
CREATE TABLE vendors (
  vendor_id SERIAL PRIMARY KEY,
  vendor_name VARCHAR(100) NOT NULL,
  category TEXT CHECK (category IN ('catering', 'photography', 'decoration', 'venue', 'others')) NOT NULL,
  contact_info VARCHAR(100) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `subscriptions`
CREATE TABLE subscriptions (
  subscription_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'expired')) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `budgets`
CREATE TABLE budgets (
  budget_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  budget_name VARCHAR(100) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  spent_amount DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `events`
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  event_name VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `catalog_invitations`
CREATE TABLE catalog_invitations (
  catalog_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  template_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `payments`
CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  subscription_id INT REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT CHECK (status IN ('paid', 'pending', 'failed')) DEFAULT 'pending'
);

-- Table structure for table `rsvps`
CREATE TABLE rsvps (
  rsvp_id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
  guest_name VARCHAR(100) NOT NULL,
  contact VARCHAR(50) DEFAULT NULL,
  status TEXT CHECK (status IN ('accepted', 'declined', 'pending')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table `user_vendors`
CREATE TABLE user_vendors (
  user_vendor_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  vendor_id INT REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
