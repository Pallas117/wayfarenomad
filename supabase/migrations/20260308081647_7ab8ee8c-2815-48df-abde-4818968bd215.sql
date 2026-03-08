ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Allow users to mark messages as read
CREATE POLICY "Users can update read status on received messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);