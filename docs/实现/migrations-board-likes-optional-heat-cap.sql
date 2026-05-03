-- 可选：上线点赞 IP 去重后，若历史上 heat_score 曾被同 IP 连点放大，
-- 可在备份数据库后将大于 1 的热度压为 1。
-- 注意：若该内容曾有多个不同访客的真实点赞，会被低估为 1。
UPDATE board_posts SET heat_score = 1 WHERE heat_score > 1;
UPDATE board_comments SET heat_score = 1 WHERE heat_score > 1;
