DELETE FROM public.events 
WHERE description ILIKE '%internet explorer%' 
   OR description ILIKE '%upgrade your browser%' 
   OR description ILIKE '%troubleshoot-internet-browser%'
   OR title ILIKE 'Discover%Events%Activities in%'
   OR title ILIKE 'Events and Things to do in%';