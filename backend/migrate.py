import os
os.environ['DATABASE_URL'] = 'postgresql://postgres:9a696029d36d9612a6dfcf188749c6f4@6uvfcvui.us-east.database.insforge.app:5432/insforge?sslmode=require'

from sqlalchemy import create_engine, text

engine = create_engine(os.environ['DATABASE_URL'])

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE agents ADD COLUMN IF NOT EXISTS confidence_threshold INTEGER DEFAULT 75"))
    conn.execute(text("ALTER TABLE agents ADD COLUMN IF NOT EXISTS channel VARCHAR DEFAULT 'webhook'"))
    conn.execute(text("ALTER TABLE agents ADD COLUMN IF NOT EXISTS auto_screen BOOLEAN DEFAULT FALSE"))
    conn.commit()
    print('Agent columns added successfully')

    result = conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications')"))
    exists = result.scalar()
    if not exists:
        conn.execute(text("""
            CREATE TABLE notifications (
                id VARCHAR PRIMARY KEY,
                message VARCHAR NOT NULL,
                type VARCHAR DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """))
        conn.commit()
        print('Notifications table created')
    else:
        print('Notifications table already exists')

print('Migration complete')
