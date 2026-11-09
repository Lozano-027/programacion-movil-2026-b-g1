package co.edu.corhuila.taskmanager.auth.dto;

import co.edu.corhuila.taskmanager.common.validation.MaxUtf8Bytes;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Registration data (BR-60, BR-61). The password limit is checked in bytes too,
 * because BCrypt rejects more than 72 bytes.
 */
public record RegisterRequest(
        @NotBlank(message = "must not be blank")
        @Email(message = "must be a valid email address")
        @Size(max = 254, message = "must have at most 254 characters")
        String email,

        @NotBlank(message = "must not be blank")
        @Size(min = 8, max = 72, message = "must have 8 to 72 characters")
        @MaxUtf8Bytes(value = 72, message = "must take at most 72 bytes; accented letters count as two")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
                message = "must contain at least one letter and one digit")
        String password) {
}
