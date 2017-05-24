extends 'api/v1/accounts/show'

media_attachments = @media_attachments_map.fetch(@object.id, [])

# FIXME: How can i render empty array simply??
if media_attachments.empty?
  node(:media_attachments) { [] }
else
  child @media_attachments_map.fetch(@object.id, []), object_root: false do
    extends 'api/v1/statuses/_media'
  end
end
