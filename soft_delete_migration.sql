-- 1. 게시물과 댓글 테이블에 삭제 여부 컬럼 추가 (Add deleted_yn columns)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_yn text DEFAULT 'N';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_yn text DEFAULT 'N';

-- 2. 댓글 수 업데이트 함수 수정 (Update function to exclude soft-deleted comments)
-- 삭제된 댓글(deleted_yn = 'Y')은 카운트에서 제외합니다.
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
DECLARE
    post_id_to_update BIGINT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        post_id_to_update := NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        post_id_to_update := OLD.post_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        post_id_to_update := NEW.post_id;
    END IF;

    UPDATE posts
    SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = post_id_to_update AND deleted_yn = 'N')
    WHERE id = post_id_to_update;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. 트리거 수정 (Update trigger to fire on UPDATE of deleted_yn)
-- 기존 트리거 삭제 후 재생성하여 UPDATE 이벤트도 감지하도록 합니다.
DROP TRIGGER IF EXISTS comments_change_trigger ON comments;

CREATE TRIGGER comments_change_trigger
AFTER INSERT OR DELETE OR UPDATE OF deleted_yn ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comments_count();
