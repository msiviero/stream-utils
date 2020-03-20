# Typescript array-like stream processign abstraction for nodejs

## Installation

```
npm i @msiviero/stream-utils
```

## Dependency injection

Base usage is simple as:

```typescript
import { Container, injectable } from "@msiviero/knit";

@injectable()
class EmailService {
  public sendEmail(recipient: string) {
    // omitted
  }
}

@injectable()
class MyApplication {

  constructor(private readonly emailService: EmailService) { }

  public run() {
    this.emailService.sendEmail("example@gmail.com");
  }
}

const app = Container.getInstance().resolve(MyApplication);

app.run();
```

Note that all instances all singleton by default
