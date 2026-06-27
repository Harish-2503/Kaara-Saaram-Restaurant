"""
Application-level exceptions.
Services raise these; controllers catch them and map to HTTP responses.
"""


class AppError(Exception):
    """Base for all application errors."""
    status_code: int = 500
    detail: str = "An unexpected error occurred"

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)


class NotFoundError(AppError):
    status_code = 404
    detail = "Resource not found"


class ConflictError(AppError):
    status_code = 409
    detail = "Resource already exists"


class ForbiddenError(AppError):
    status_code = 403
    detail = "Forbidden"


class ValidationError(AppError):
    status_code = 422
    detail = "Validation error"
