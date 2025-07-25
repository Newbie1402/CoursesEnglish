package com.Courses.Courses.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    BAD_REQUEST(400, "Invalid request", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTS(409, "Email already exists", HttpStatus.CONFLICT),
    PHONE_EXISTS(409, "Phone already exists", HttpStatus.CONFLICT),
    UNAUTHORIZED(401, "Unauthorized access", HttpStatus.UNAUTHORIZED),
    UNAUTHENTICATED(401, "Wrong password or email", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN(401, "Invalid token", HttpStatus.UNAUTHORIZED),
    NOT_FOUND(404, "Resource not found", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND(404, "User not found", HttpStatus.NOT_FOUND),
    INVALID_CREDENTIAL(401, "Invalid credentials", HttpStatus.NOT_FOUND),

    // Server error messages
    SERVER_ERROR(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    UNCATEGORIZED_EXCEPTION(403, "Unauthorized", HttpStatus.UNAUTHORIZED),

    // Validation error messages
    INVALID_EMAIL_FORMAT(400, "Invalid email format", HttpStatus.BAD_REQUEST),
    INVALID_PHONE_NUMBER(400, "Invalid phone number format", HttpStatus.BAD_REQUEST),
    EMPTY_FIELD(400, "Required field cannot be empty", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_WEAK(400, "Password is too weak", HttpStatus.BAD_REQUEST),
    INVALID_DATE_FORMAT(400, "Invalid date format", HttpStatus.BAD_REQUEST),
    FIELD_LENGTH_EXCEEDED(400, "Field length exceeded the allowed limit", HttpStatus.BAD_REQUEST),
    VALUE_OUT_OF_RANGE(400, "Value is out of the acceptable range", HttpStatus.BAD_REQUEST),
    RECAPTCHA_FAILED(400, "Recaptcha verification failed", HttpStatus.BAD_REQUEST),

    UPDATE_ERROR(200, "Update fail", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
