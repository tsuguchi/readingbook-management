module Api
  module V1
    class BooksController < ApplicationController
      include Authenticatable

      before_action :set_book, only: %i[show update destroy]

      def index
        books = current_user.books
        if params[:status].present? && Book.statuses.key?(params[:status])
          books = books.where(status: params[:status])
        end
        render json: books.order(updated_at: :desc).map { |book| book_response(book) }
      end

      def show
        render json: book_response(@book)
      end

      def create
        book = current_user.books.new(book_params)
        if book.save
          render json: book_response(book), status: :created
        else
          render json: { errors: book.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @book.update(book_params)
          render json: book_response(@book)
        else
          render json: { errors: @book.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @book.destroy
        head :no_content
      end

      private

      def set_book
        @book = current_user.books.find_by(id: params[:id])
        render json: { error: "Not found" }, status: :not_found unless @book
      end

      def book_params
        params.permit(:title, :author, :status, :memo, :finished_at)
      end

      def book_response(book)
        {
          id: book.id,
          title: book.title,
          author: book.author,
          status: book.status,
          memo: book.memo,
          finished_at: book.finished_at,
          created_at: book.created_at,
          updated_at: book.updated_at
        }
      end
    end
  end
end
