class CreateBooks < ActiveRecord::Migration[8.1]
  def change
    create_table :books do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.string :author
      t.integer :status, null: false, default: 0
      t.datetime :finished_at
      t.text :memo

      t.timestamps
    end
    add_index :books, [:user_id, :status]
  end
end
