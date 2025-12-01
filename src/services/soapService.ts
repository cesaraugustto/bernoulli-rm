const SOAP_URL = "https://tbc-hml.bernoulli.com.br:8077/wsDataServer/IwsDataServer";

export async function isValidDataServer(dataServerName: string, username: string, password: string) {
    const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tot="http://www.totvs.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <tot:IsValidDataServer>
         <tot:DataServerName>${dataServerName}</tot:DataServerName>
      </tot:IsValidDataServer>
   </soapenv:Body>
</soapenv:Envelope>`;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', SOAP_URL, true);
        xhr.setRequestHeader('Content-Type', 'text/xml;charset=UTF-8');
        xhr.setRequestHeader('SOAPAction', 'http://www.totvs.com/IsValidDataServer');
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(`${username}:${password}`));
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`SOAP Error ${xhr.status}: ${xhr.responseText}`));
            }
        };
        
        xhr.onerror = function() {
            reject(new Error('Network error - Verifique se o servidor está acessível'));
        };
        
        xhr.send(xmlBody);
    });
}

export function parseIsValidDataServerResponse(xmlResponse: string): boolean {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlResponse, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("IsValidDataServerResult")[0];
    
    if (resultNode) {
        return resultNode.textContent === "true";
    }
    
    return false;
}