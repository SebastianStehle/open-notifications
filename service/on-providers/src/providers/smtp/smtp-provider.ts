import { ProviderInfoDto, SendEmailDto, NotificationStatus } from 'src/dtos';
import { Provider } from '../interface';
import * as nodemailer from 'nodemailer';

export class SmtpProvider implements Provider {
  name = 'smtp';

  spec: ProviderInfoDto = {
    displayName: 'SMTP',
    description: {
      en: 'Send Emails using any SMPT email server',
    },
    type: 'Email',
    properties: {
      serverHost: {
        type: 'String',
        displayName: {
          en: 'Host',
        },
        description: {
          en: 'The hostname of the server',
        },
        required: true,
      },
      serverPort: {
        type: 'Number',
        displayName: {
          en: 'Port',
        },
        description: {
          en: 'The port of the server.',
        },
        defaultValue: 587,
      },
      username: {
        type: 'String',
        displayName: {
          en: 'Username',
        },
        description: {
          en: 'The username to authenticate with the server.',
        },
      },
      password: {
        type: 'String',
        displayName: {
          en: 'Password',
        },
        description: {
          en: 'The password to authenticate with the server.',
        },
      },
      fromEmail: {
        type: 'String',
        displayName: {
          en: 'From Email',
        },
        description: {
          en: 'The email-address of the sender.',
        },
      },
      fromName: {
        type: 'String',
        displayName: {
          en: 'From Name.',
        },
        description: {
          en: 'The display name of the sender.',
        },
      },
    },
  };

  getSpec() {
    return this.spec;
  }

  async sendEmail?(request: SendEmailDto): Promise<NotificationStatus> {
    const {
      fromEmail,
      fromName,
      password,
      serverHost,
      serverPort,
      username,
    }: {
      fromEmail: string;
      fromName?: string;
      password?: string;
      serverHost: string;
      serverPort?: number;
      username?: string;
    } = request.properties as any;

    const transport = nodemailer.createTransport({
      host: serverHost,
      port: serverPort || 587,
      secure: true,
      auth: {
        user: username,
        pass: password,
      },
    });

    try {
      const to = request.payload.to;

      const info = await transport.sendMail({
        from: { name: fromName, address: fromEmail },
        to: request.payload.to,
        subject: request.payload.subject,
        text: request.payload.bodyText,
        html: request.payload.bodyEmail,
      });

      if (info.accepted.find((x) => x === to || x['address'] === to)) {
        return 'Sent';
      }

      if (info.rejected.find((x) => x === to || x['address'] === to)) {
        return 'Failed';
      }

      if (info.pending.find((x) => x === to || x['address'] === to)) {
        return 'Pending';
      }

      return 'Unknown';
    } finally {
      transport.close?.();
    }
  }
}
