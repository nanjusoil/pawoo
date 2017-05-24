attributes :id, :created_at, :in_reply_to_id, :in_reply_to_account_id, :sensitive, :spoiler_text, :visibility
node(:content) { |status| Formatter.instance.plaintext(status) }
