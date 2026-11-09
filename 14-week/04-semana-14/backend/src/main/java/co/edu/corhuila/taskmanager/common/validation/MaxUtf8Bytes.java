package co.edu.corhuila.taskmanager.common.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Limits a string by its size in UTF-8 bytes, not in characters. BCrypt only accepts
 * 72 bytes, and a letter such as "ñ" takes two, so {@code @Size} alone is not enough.
 */
@Documented
@Constraint(validatedBy = MaxUtf8BytesValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface MaxUtf8Bytes {

    int value();

    String message() default "is too long";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
