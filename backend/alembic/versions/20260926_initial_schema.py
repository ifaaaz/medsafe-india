"""initial schema

Revision ID: 20260926_initial_schema
Revises: 
Create Date: 2026-09-26 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260926_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create data_sources table
    op.create_table(
        'data_sources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_data_sources_id'), 'data_sources', ['id'], unique=False)
    op.create_index(op.f('ix_data_sources_name'), 'data_sources', ['name'], unique=True)

    # Create active_ingredients table
    op.create_table(
        'active_ingredients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_active_ingredients_id'), 'active_ingredients', ['id'], unique=False)
    op.create_index(op.f('ix_active_ingredients_name'), 'active_ingredients', ['name'], unique=True)

    # Create medicines table (MedicineBrand)
    op.create_table(
        'medicines',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('brand_name', sa.String(), nullable=False),
        sa.Column('generic_name', sa.String(), nullable=False),
        sa.Column('normalized_brand_name', sa.String(), nullable=False),
        sa.Column('manufacturer', sa.String(), nullable=False),
        sa.Column('dosage_form', sa.String(), nullable=False),
        sa.Column('strength', sa.String(), nullable=False),
        sa.Column('source_reference', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_medicines_id'), 'medicines', ['id'], unique=False)
    op.create_index(op.f('ix_medicines_brand_name'), 'medicines', ['brand_name'], unique=False)
    op.create_index(op.f('ix_medicines_generic_name'), 'medicines', ['generic_name'], unique=False)
    op.create_index(op.f('ix_medicines_normalized_brand_name'), 'medicines', ['normalized_brand_name'], unique=False)

    # Create medicine_aliases table
    op.create_table(
        'medicine_aliases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('medicine_id', sa.Integer(), nullable=False),
        sa.Column('alias_name', sa.String(), nullable=False),
        sa.Column('normalized_alias', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['medicine_id'], ['medicines.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_medicine_aliases_id'), 'medicine_aliases', ['id'], unique=False)
    op.create_index(op.f('ix_medicine_aliases_alias_name'), 'medicine_aliases', ['alias_name'], unique=False)
    op.create_index(op.f('ix_medicine_aliases_normalized_alias'), 'medicine_aliases', ['normalized_alias'], unique=False)

    # Create medicine_ingredients association table
    op.create_table(
        'medicine_ingredients',
        sa.Column('medicine_id', sa.Integer(), nullable=False),
        sa.Column('ingredient_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['ingredient_id'], ['active_ingredients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['medicine_id'], ['medicines.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('medicine_id', 'ingredient_id')
    )

def downgrade() -> None:
    op.drop_table('medicine_ingredients')
    op.drop_index(op.f('ix_medicine_aliases_normalized_alias'), table_name='medicine_aliases')
    op.drop_index(op.f('ix_medicine_aliases_alias_name'), table_name='medicine_aliases')
    op.drop_index(op.f('ix_medicine_aliases_id'), table_name='medicine_aliases')
    op.drop_table('medicine_aliases')
    op.drop_index(op.f('ix_medicines_normalized_brand_name'), table_name='medicines')
    op.drop_index(op.f('ix_medicines_generic_name'), table_name='medicines')
    op.drop_index(op.f('ix_medicines_brand_name'), table_name='medicines')
    op.drop_index(op.f('ix_medicines_id'), table_name='medicines')
    op.drop_table('medicines')
    op.drop_index(op.f('ix_active_ingredients_name'), table_name='active_ingredients')
    op.drop_index(op.f('ix_active_ingredients_id'), table_name='active_ingredients')
    op.drop_table('active_ingredients')
    op.drop_index(op.f('ix_data_sources_name'), table_name='data_sources')
    op.drop_index(op.f('ix_data_sources_id'), table_name='data_sources')
    op.drop_table('data_sources')