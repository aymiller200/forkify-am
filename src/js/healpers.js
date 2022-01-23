import { TIMEOUT_SEC } from './config';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`))
    }, s * 1000)
  });
};

export const AJAX = async function(url,uploadData = undefined){
  try {
  const fetchPro = uploadData ? fetch(url, {
    method: 'POST',
    headers: { //snippets of text explaining to the API what we are sending
      'Content-Type': 'application/json' //we specify that the data we send is going to be in the json format
    },
    body: JSON.stringify(uploadData) //data we convert to JSON so it can be sent
  }) : fetch(url)
   
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
    const data = await res.json()
    if (!res.ok) throw new Error(`${data.message} (${res.status})`)
    return data
  } catch (err) {
    throw(err);
  }
}

/*
export const getJSON = async function (url) {
  try {
    const fetchPro = 
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
    const data = await res.json()
    if (!res.ok) throw new Error(`${data.message} (${res.status})`)
    return data
  } catch (err) {
    throw(err);
  }
}

export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPro = 
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
    const data = await res.json()
    if (!res.ok) throw new Error(`${data.message} (${res.status})`)
    return data
  } catch (err) {
    throw(err);
  }
}
*/
