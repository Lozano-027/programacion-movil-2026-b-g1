package co.edu.corhuila.taskmanager.common.validation;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class MaxUtf8BytesValidatorTest {

    private record Sample(@MaxUtf8Bytes(4) String value) {
    }

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    private Set<ConstraintViolation<Sample>> validate(String value) {
        return validator.validate(new Sample(value));
    }

    @Test
    @DisplayName("BR-61: the limit counts UTF-8 bytes, so two-byte letters count double")
    void countsBytesNotCharacters() {
        assertThat(validate("abcd")).isEmpty();
        assertThat(validate("ññ")).isEmpty();
        assertThat(validate("ñña")).hasSize(1);
    }

    @Test
    @DisplayName("A null value is left to @NotBlank")
    void acceptsNull() {
        assertThat(validate(null)).isEmpty();
    }
}
