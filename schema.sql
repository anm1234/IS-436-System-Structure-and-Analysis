

-- OPTIONAL: Drop existing tables

-- DROP TABLE IF EXISTS public.Holding CASCADE;
-- DROP TABLE IF EXISTS public.Transactions CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;


-- USERS TABLE

CREATE TABLE IF NOT EXISTS public.users  (
  id SERIAL PRIMARY KEY,
  email VARCHAR,
  password VARCHAR,
  fname VARCHAR,
  lname VARCHAR,
  balance INTEGER
);

-- HOLDING TABLE

CREATE TABLE IF NOT EXISTS public.Holding (
  asset_id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id),
  asset_name VARCHAR,
  asset_amount DOUBLE PRECISION
);

-- TRANSACTIONS TABLE

CREATE TABLE IF NOT EXISTS public.Transactions (
  transaction_id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id),
  coin VARCHAR,
  amount SMALLINT,
  price SMALLINT,
  transaction_type VARCHAR
);



-- Insert sample users
INSERT INTO public.users (email, password, fname, lname, balance)
VALUES
('test1@example.com', 'hashed_pw_1', 'John', 'Doe', 500),
('test2@example.com', 'hashed_pw_2', 'Jane', 'Smith', 500);

-- Insert sample holdings
INSERT INTO public.Holding (user_id, asset_name, asset_amount)
VALUES
(1, 'BTC', 0.52),
(1, 'ETH', 3.1),
(2, 'ADA', 1200);

-- Insert sample transactions
INSERT INTO public.Transactions (user_id, coin, amount, price, transaction_type)
VALUES
(1, 'BTC', 1, 42000, 'buy'),
(1, 'ETH', 2, 2500, 'buy'),
(2, 'ADA', 1000, 1, 'buy');
