-- DAY TO DAY QUERIES
  SELECT * FROM users;
  SELECT * FROM entries;
  SELECT * FROM requests;
  SELECT * FROM responses;

  DELETE FROM entries;
  DELETE FROM requests;
  DELETE FROM responses;

  ALTER SEQUENCE entries_id_seq RESTART WITH 1;