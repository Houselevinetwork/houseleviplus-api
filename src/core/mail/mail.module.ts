import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@core/config/config.service';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { HandlebarsAdapter } = require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter');

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.mailHost,
          port: configService.mailPort,
          secure: false,
          auth: {
            user: configService.mailUser,
            pass: configService.mailPassword,
          },
        },
        defaults: {
          from: `"ReelAfrika" <${configService.mailFrom}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}