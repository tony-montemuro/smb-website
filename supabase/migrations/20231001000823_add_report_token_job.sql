SELECT cron.schedule(
    'Reset report tokens',
    '0 0 * * *',
    $$    
        UPDATE profile
        SET report_token = 10
    $$
);