# twain-cloud-express
All-in-one TWAIN Cloud implementation using Node.js Express web framework

## Run with Node.js

 - Clone [twain-cloud-express](https://github.com/twain/twain-cloud-express) repository
 - Make sure that you have [Node.js](https://nodejs.org/en/) installed
 - Run ```npm i``` command (this will bring in necessary dependencies)
 - Run ```npm start``` command
 - Open browser and navigate to http://localhost:3000

## Run with Docker

 - Clone [twain-cloud-express](https://github.com/twain/twain-cloud-express) repository
 - Run ```docker build -t twain-cloud .``` command in root folder or the repository
 - Run ```docker run -p 3000:80 twain-cloud``` command (here we map 80 port of the container to local port 3000) 
 
## Test with TWAIN Direct applications
Initial steps:
 - Clone [twain-direct]() repository
 - Update App.config files of TwainDirect.Scanner and TwainDirect.App projects using the following settings:
   ```xml
   <appSettings>
    <add key="CloudApiRoot" value="http://localhost:3000/api"/>
    <add key="CloudManager" value="http://localhost:3000"/>
    <add key="CloudUseHttps" value="no"/>
   </appSettings>
   ```
 - Build TwainDirect.Scanner and TwainDirect.App applications

### Connect TWAIN Direct Device
 - Start TwainDirect.Scanner app and press ```Setup...``` button
 - Press ```Register Cloud...``` button to register selected TWAIN scanner with TWAIN Cloud implementation you run locally
 - Press ```Start``` button on main form to connect to TWAIN Cloud and listen for connections
 
### Connect TWAIN Direct Application
 - Start TwainDirect.App application and press ```Cloud...``` button to authenticate with TWAIN Cloud implementation you run locally
 - Press ```Select...``` button to pick cloud scanner to work with
 - Press ```Scan``` button to acquire an image from TWAIN Direct device
