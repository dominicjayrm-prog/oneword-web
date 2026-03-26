-- Archive functions for the OneWord website
-- These power the /archive page, showing past words and top descriptions

-- Function 1: Get archive calendar data
-- Returns all past dates with their word and player count
CREATE OR REPLACE FUNCTION get_archive_calendar(p_language TEXT DEFAULT 'en')
RETURNS TABLE (
  word_date DATE,
  word TEXT,
  category TEXT,
  player_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dw.date AS word_date,
    dw.word,
    dw.category,
    COUNT(DISTINCT d.user_id) AS player_count
  FROM daily_words dw
  LEFT JOIN descriptions d ON d.word_id = dw.id
  WHERE dw.date < game_date()
    AND dw.language = p_language
  GROUP BY dw.date, dw.word, dw.category
  ORDER BY dw.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get top descriptions for a specific date
-- Returns the top 10 descriptions ranked by Elo rating
CREATE OR REPLACE FUNCTION get_archive_day(p_date DATE, p_language TEXT DEFAULT 'en')
RETURNS TABLE (
  word TEXT,
  category TEXT,
  word_date DATE,
  description TEXT,
  username TEXT,
  elo_rating INT,
  rank INT,
  vote_count INT,
  player_count BIGINT
) AS $$
DECLARE
  v_word_id UUID;
  v_total BIGINT;
BEGIN
  -- Get the word for this date and language
  SELECT dw.id INTO v_word_id
  FROM daily_words dw
  WHERE dw.date = p_date AND dw.language = p_language;

  IF v_word_id IS NULL THEN
    RETURN;
  END IF;

  -- Get total player count
  SELECT COUNT(DISTINCT d.user_id) INTO v_total
  FROM descriptions d
  WHERE d.word_id = v_word_id;

  RETURN QUERY
  SELECT
    dw.word,
    dw.category,
    dw.date AS word_date,
    d.description,
    p.username,
    d.elo_rating,
    d.rank,
    d.vote_count,
    v_total AS player_count
  FROM descriptions d
  JOIN daily_words dw ON d.word_id = dw.id
  JOIN profiles p ON d.user_id = p.id
  WHERE d.word_id = v_word_id
  ORDER BY d.vote_count DESC, d.elo_rating DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
