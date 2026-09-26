CREATE TABLE app_user (
  id bigint NOT NULL AUTO_INCREMENT,
  bio text,
  created_at datetime(6) NOT NULL,
  display_name varchar(255) DEFAULT NULL,
  email varchar(255) NOT NULL,
  is_active bit(1) NOT NULL,
  password_hash varchar(255) NOT NULL,
  preferred_language varchar(255) DEFAULT NULL,
  profile_image varchar(255) DEFAULT NULL,
  role enum('ADMIN','USER') NOT NULL,
  updated_at datetime(6) NOT NULL,
  username varchar(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_app_user_email (email),
  UNIQUE KEY uk_app_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE genres (
  id bigint NOT NULL AUTO_INCREMENT,
  created_at datetime(6) NOT NULL,
  name varchar(255) NOT NULL,
  tmdb_genre_id int DEFAULT NULL,
  updated_at datetime(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_genres_name (name),
  UNIQUE KEY uk_genres_tmdb_genre_id (tmdb_genre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mood_tags (
  id bigint NOT NULL AUTO_INCREMENT,
  created_at datetime(6) NOT NULL,
  description varchar(255) DEFAULT NULL,
  name varchar(255) NOT NULL,
  updated_at datetime(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mood_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE titles (
  id bigint NOT NULL AUTO_INCREMENT,
  backdrop_path varchar(255) DEFAULT NULL,
  country varchar(255) DEFAULT NULL,
  created_at datetime(6) NOT NULL,
  name varchar(255) NOT NULL,
  original_language varchar(255) DEFAULT NULL,
  original_name varchar(255) DEFAULT NULL,
  overview text,
  poster_path varchar(255) DEFAULT NULL,
  release_date date DEFAULT NULL,
  runtime_minutes int DEFAULT NULL,
  tmdb_id bigint DEFAULT NULL,
  tmdb_vote_average double DEFAULT NULL,
  tmdb_vote_count int DEFAULT NULL,
  type enum('MOVIE','SERIES') NOT NULL,
  updated_at datetime(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_titles_tmdb_id_type (tmdb_id,type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
  id bigint NOT NULL AUTO_INCREMENT,
  action enum('GENRE_CREATED','GENRE_DELETED','GENRE_UPDATED','LOGIN','MOOD_TAG_CREATED','MOOD_TAG_DELETED','MOOD_TAG_UPDATED','REGISTER','REVIEW_CREATED','REVIEW_DELETED','REVIEW_HIDDEN','REVIEW_MODERATED','REVIEW_RESTORED','REVIEW_UPDATED','TITLE_CREATED','TITLE_DELETED','TITLE_IMPORTED','TITLE_UPDATED','USER_ACTIVATED','USER_DEACTIVATED','USER_ROLE_UPDATED','WATCHLIST_UPDATED','WATCH_LOG_CREATED') NOT NULL,
  created_at datetime(6) NOT NULL,
  description text,
  target_id bigint DEFAULT NULL,
  target_type varchar(255) DEFAULT NULL,
  actor_user_id bigint DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_audit_logs_actor_user_id (actor_user_id),
  CONSTRAINT fk_audit_logs_actor_user FOREIGN KEY (actor_user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reviews (
  id bigint NOT NULL AUTO_INCREMENT,
  contains_spoiler bit(1) NOT NULL,
  created_at datetime(6) NOT NULL,
  is_visible bit(1) NOT NULL,
  review_language varchar(255) DEFAULT NULL,
  rating double DEFAULT NULL,
  review_text text,
  updated_at datetime(6) NOT NULL,
  title_id bigint NOT NULL,
  user_id bigint NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_reviews_user_title (user_id,title_id),
  KEY idx_reviews_title_id (title_id),
  CONSTRAINT fk_reviews_title FOREIGN KEY (title_id) REFERENCES titles (id),
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE title_genres (
  id bigint NOT NULL AUTO_INCREMENT,
  created_at datetime(6) NOT NULL,
  genre_id bigint NOT NULL,
  title_id bigint NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_title_genres_title_genre (title_id,genre_id),
  KEY idx_title_genres_genre_id (genre_id),
  CONSTRAINT fk_title_genres_title FOREIGN KEY (title_id) REFERENCES titles (id),
  CONSTRAINT fk_title_genres_genre FOREIGN KEY (genre_id) REFERENCES genres (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE title_mood_tags (
  id bigint NOT NULL AUTO_INCREMENT,
  created_at datetime(6) NOT NULL,
  mood_tag_id bigint NOT NULL,
  title_id bigint NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_title_mood_tags_title_mood_tag (title_id,mood_tag_id),
  KEY idx_title_mood_tags_mood_tag_id (mood_tag_id),
  CONSTRAINT fk_title_mood_tags_title FOREIGN KEY (title_id) REFERENCES titles (id),
  CONSTRAINT fk_title_mood_tags_mood_tag FOREIGN KEY (mood_tag_id) REFERENCES mood_tags (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE watch_logs (
  id bigint NOT NULL AUTO_INCREMENT,
  created_at datetime(6) NOT NULL,
  is_rewatch bit(1) NOT NULL,
  memory_note text,
  updated_at datetime(6) NOT NULL,
  watch_company enum('ALONE','FAMILY','FRIENDS','OTHER','PARTNER') DEFAULT NULL,
  watch_place enum('CINEMA','HOME','OTHER','SCHOOL','STREAMING') DEFAULT NULL,
  watched_date date DEFAULT NULL,
  title_id bigint NOT NULL,
  user_id bigint NOT NULL,
  PRIMARY KEY (id),
  KEY idx_watch_logs_title_id (title_id),
  KEY idx_watch_logs_user_id (user_id),
  CONSTRAINT fk_watch_logs_title FOREIGN KEY (title_id) REFERENCES titles (id),
  CONSTRAINT fk_watch_logs_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE watch_log_moods (
  id bigint NOT NULL AUTO_INCREMENT,
  created_at datetime(6) NOT NULL,
  mood_tag_id bigint NOT NULL,
  watch_log_id bigint NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_watch_log_moods_watch_log_mood_tag (watch_log_id,mood_tag_id),
  KEY idx_watch_log_moods_mood_tag_id (mood_tag_id),
  CONSTRAINT fk_watch_log_moods_watch_log FOREIGN KEY (watch_log_id) REFERENCES watch_logs (id),
  CONSTRAINT fk_watch_log_moods_mood_tag FOREIGN KEY (mood_tag_id) REFERENCES mood_tags (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE watchlist_items (
  id bigint NOT NULL AUTO_INCREMENT,
  created_at datetime(6) NOT NULL,
  is_favorite bit(1) NOT NULL,
  status enum('DROPPED','WANT_TO_WATCH','WATCHED','WATCHING') NOT NULL,
  updated_at datetime(6) NOT NULL,
  title_id bigint NOT NULL,
  user_id bigint NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_watchlist_items_user_title (user_id,title_id),
  KEY idx_watchlist_items_title_id (title_id),
  CONSTRAINT fk_watchlist_items_title FOREIGN KEY (title_id) REFERENCES titles (id),
  CONSTRAINT fk_watchlist_items_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
