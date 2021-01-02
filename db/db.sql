-- DAY TO DAY QUERIES
  SELECT * FROM users;
  SELECT * FROM entries;
  SELECT * FROM requests;
  SELECT * FROM responses;

  DELETE FROM entries;
  DELETE FROM requests;
  DELETE FROM responses;

  ALTER SEQUENCE entries_id_seq RESTART WITH 1;

-- ADMIN QUERIES
SELECT COUNT(*) as total_users FROM users; -- 1.a
SELECT COUNT(*) as total_entries FROM entries; -- custom


-- WHICH ONE?
SELECT COUNT(*) AS unique_domains FROM (SELECT DISTINCT server_ip_address FROM entries) AS temp; -- 1.d
SELECT COUNT(*) AS unique_domains FROM (SELECT DISTINCT host FROM requests) AS temp; -- 1.d

SELECT COUNT(*) AS unique_isps FROM (SELECT DISTINCT isp FROM entries) AS temp; -- 1.e