insert into public.restaurants (id, name, normalized_name, area, address, latitude, longitude, cuisines) values
  ('11111111-1111-4111-8111-111111111111', 'Lucali', 'lucali', 'Brooklyn', '575 Henry St, Brooklyn, NY', 40.6818, -74.0004, array['italian','pizza']),
  ('22222222-2222-4222-8222-222222222222', 'Ugly Baby', 'ugly baby', 'Brooklyn', '407 Smith St, Brooklyn, NY', 40.6802, -73.9950, array['thai']),
  ('33333333-3333-4333-8333-333333333333', 'Peaches HotHouse', 'peaches hothouse', 'Brooklyn', '415 Tompkins Ave, Brooklyn, NY', 40.6834, -73.9445, array['southern','american'])
on conflict do nothing;

insert into public.recommendation_evidence (restaurant_id, source_url, source_profile, published_at, cuisine_clues) values
  ('11111111-1111-4111-8111-111111111111', 'https://www.instagram.com/explore/tags/brooklynpizza/', 'brooklyneats', now() - interval '2 days', array['italian','pizza']),
  ('22222222-2222-4222-8222-222222222222', 'https://www.instagram.com/explore/tags/brooklynthai/', 'nycfood', now() - interval '6 days', array['thai']),
  ('33333333-3333-4333-8333-333333333333', 'https://www.instagram.com/explore/tags/brooklynfood/', 'eatbrooklyn', now() - interval '15 days', array['southern'])
on conflict do nothing;
