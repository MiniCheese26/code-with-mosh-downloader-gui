import {dialog} from 'electron';
import fetch, {Response} from 'node-fetch';

export const options = {
  method: 'GET',
  headers: {
	Cookie: '_session_id=bc2924a7e946b78855a2c81297361866',
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:90.0) Gecko/20100101 Firefox/90.0',
	Host: 'codewithmosh.com',
	Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding': 'gzip, deflate, br',
	'Accept-Language': 'en-GB,en;q=0.5',
	'Cache-Control': 'no-cache',
	Connection: 'keep-alive',
	DNT: '1',
	Pragma: 'no-cache'
  }
};

export async function get(url: string): Promise<string | null> {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch (e) {
    console.log(e);
    return null;
  }

  if (!response.ok) {
    console.log(response.statusText);
    return null;
  }

  return await response.text();
}

export function setSessionCookie(session: string) {
  if (!session) {
    dialog.showErrorBox('Error', 'Session cookie was null or empty, set it in settings.json');
    throw new Error('Session cookie was null or empty, set it in settings.json');
  }

  options.headers.Cookie = `_session_id=${session}`;
}

export async function validateSession() {
  const response = await get('https://codewithmosh.com/');

  if (!response) {
    return false;
  }

  const html = response.toHtml();

  return html.querySelector('#header-sign-up-btn') === null;
}
