create policy "Authenticated users can insert png w/profile ID 1oj01fe_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'avatars'::text) AND (storage.filename(name) = (get_profile_id() || '.png'::text)) AND (storage.extension(name) = 'png'::text)));


create policy "Authenticated users can update png w/profile ID 1oj01fe_0"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'avatars'::text) AND (storage.filename(name) = (get_profile_id() || '.png'::text)) AND (storage.extension(name) = 'png'::text)))
with check (((bucket_id = 'avatars'::text) AND (storage.filename(name) = (get_profile_id() || '.png'::text)) AND (storage.extension(name) = 'png'::text)));


create policy "Avatars are publicly accessible 1oj01fe_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'avatars'::text));


create policy "Box art is publicly avaliable 1mf269_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'games'::text));



