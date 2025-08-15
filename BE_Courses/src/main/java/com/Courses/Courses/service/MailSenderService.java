package com.Courses.Courses.service;

import com.Courses.Courses.model.response.ResponseData;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class MailSenderService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public ResponseEntity<ResponseData<Void>> sendNotification(String toEmail) throws MessagingException {
        Context context = new Context();
        context.setVariable("email", toEmail);

        String htmlContent = templateEngine.process("AcceptedAccountNotification", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(toEmail);
        helper.setSubject("Email từ E-Course");
        helper.setText(htmlContent, true);

        mailSender.send(message);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(200, "Gửi mail thành công", null)
        );
    }
}


