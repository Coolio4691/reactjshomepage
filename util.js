function doSelected(target) {
    pageContainer.pages.filter(i => i.pageIconElem.current.attributes["selected"] != null).every(v => { v.pageIconElem.current.removeAttribute("selected") })
    
    target.ref.current.setAttribute("selected", "")
}

function handleLoad(e) {
    pageIconElements.push(e.target)
    pageContainer.pages[e.target.getAttribute("position")].pageIcon = e.target;
    
}

function handleClick(e) {
    changePage(e.target.getAttribute("position"), "set")
}


async function changePage(direction, method) {
    var oldPosOffset = pageContainer.positionOffset;
    if(method == "set")
        pageContainer.positionOffset = direction
    else 
        pageContainer.positionOffset += ( direction > 0 ? 1 : - 1)

    var newPage = pageContainer.pages[pageContainer.positionOffset]
    if(!newPage) {
      pageContainer.positionOffset = oldPosOffset 
      
      var nPage = pageContainer.pages[pageContainer.positionOffset];

      if(await caches.has(nPage.name)) {
        var cache = await caches.open(nPage.name)
  
        document.getElementById("backgroundLabel").style.backgroundImage = `url("${await (await cache.match(nPage.name)).text()}")`
      }

      return
    }

    newPage.page.style.backgroundPosition = currentBackgroundPos
    newPage.page.scrollIntoView({ behavior: "smooth", block: "end" })
    doSelected(newPage.pageIcon)

    if(await caches.has(newPage.name)) {
      var cache = await caches.open(newPage.name)

      document.getElementById("backgroundLabel").style.backgroundImage = `url("${await (await cache.match(newPage.name)).text()}")`
    }
}


var maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = '-', baseMinusTMin = base - tMin;

const digitToBasic = function(digit, flag) {
	//  0..25 map to ASCII a..z or A..Z
	// 26..35 map to ASCII 0..9
	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};

const adapt = function(delta, numPoints, firstTime) {
	let k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
		delta = floor(delta / baseMinusTMin);
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

const floor = Math.floor;

function map(array, fn) {
	const result = [];
	let length = array.length;
	while (length--) {
		result[length] = fn(array[length]);
	}
	return result;
}

function ucs2decode(string) {
	const output = [];
	let counter = 0;
	const length = string.length;
	while (counter < length) {
		const value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			const extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push(value);
				counter--;
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

const stringFromCharCode = String.fromCharCode;

const encode = function(input) {
	const output = [];

	// Convert the input in UCS-2 to an array of Unicode code points.
	input = ucs2decode(input);

	// Cache the length.
	let inputLength = input.length;

	// Initialize the state.
	let n = 128;
	let delta = 0;
	let bias = 72;

	// Handle the basic code points.
	for (const currentValue of input) {
		if (currentValue < 0x80) {
			output.push(stringFromCharCode(currentValue));
		}
	}

	let basicLength = output.length;
	let handledCPCount = basicLength;

	// `handledCPCount` is the number of code points that have been handled;
	// `basicLength` is the number of basic code points.

	// Finish the basic string with a delimiter unless it's empty.
	if (basicLength) {
		output.push('-');
	}

	// Main encoding loop:
	while (handledCPCount < inputLength) {

		// All non-basic code points < n have been handled already. Find the next
		// larger one:
		let m = 2147483647;
		for (const currentValue of input) {
			if (currentValue >= n && currentValue < m) {
				m = currentValue;
			}
		}

		// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
		// but guard against overflow.
		const handledCPCountPlusOne = handledCPCount + 1;
		if (m - n > floor((2147483647 - delta) / handledCPCountPlusOne)) {
			error('overflow');
		}

		delta += (m - n) * handledCPCountPlusOne;
		n = m;

		for (const currentValue of input) {
			if (currentValue < n && ++delta > 2147483647) {
				error('overflow');
			}
			if (currentValue == n) {
				// Represent delta as a generalized variable-length integer.
				let q = delta;
				for (let k = base; /* no condition */; k += base) {
					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
					if (q < t) {
						break;
					}
					const qMinusT = q - t;
					const baseMinusT = base - t;
					output.push(
						stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
					);
					q = floor(qMinusT / baseMinusT);
				}

				output.push(stringFromCharCode(digitToBasic(q, 0)));
				bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
				delta = 0;
				++handledCPCount;
			}
		}

		++delta;
		++n;

	}
	return output.join('');
};

function mapDomain(string, fn) {
	const parts = string.split('@');
	let result = '';
	if (parts.length > 1) {
		// In email addresses, only the domain name should be punycoded. Leave
		// the local part (i.e. everything up to `@`) intact.
		result = parts[0] + '@';
		string = parts[1];
	}
	// Avoid `split(regex)` for IE8 compatibility. See #17.
	string = string.replace(/[\x2E\u3002\uFF0E\uFF61]/g, '\x2E');
	const labels = string.split('.');
	const encoded = map(labels, fn).join('.');
	return result + encoded;
}

function toASCII(input) {
	return mapDomain(input, function(string) {
		return /[^\0-\x7E]/.test(string)
			? 'xn--' + encode(string)
			: string;
	});
};

var internals = {};

$.getJSON("rules.json", data => {
  internals.rules = data.map(function (rule) {

        return {
            rule: rule,
            suffix: rule.replace(/^(\*\.|\!)/, ''),
            punySuffix: -1,
            wildcard: rule.charAt(0) === '*',
            exception: rule.charAt(0) === '!'
        };
    });
})
internals.validate = function (input) {

    // Before we can validate we need to take care of IDNs with unicode chars.
    var ascii = toASCII(input);
  
    if (ascii.length < 1) {
        return 'DOMAIN_TOO_SHORT';
    }
    if (ascii.length > 255) {
        return 'DOMAIN_TOO_LONG';
    }
  
    // Check each part's length and allowed chars.
    var labels = ascii.split('.');
    var label;
  
    for (var i = 0; i < labels.length; ++i) {
        label = labels[i];
        if (!label.length) {
        return 'LABEL_TOO_SHORT';
        }
        if (label.length > 63) {
        return 'LABEL_TOO_LONG';
        }
        if (label.charAt(0) === '-') {
        return 'LABEL_STARTS_WITH_DASH';
        }
        if (label.charAt(label.length - 1) === '-') {
        return 'LABEL_ENDS_WITH_DASH';
        }
        if (!/^[a-z0-9\-]+$/.test(label)) {
        return 'LABEL_INVALID_CHARS';
        }
    }
};

internals.endsWith = function (str, suffix) {

    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

internals.findRule = function (domain) {

    var punyDomain = toASCII(domain);
    return internals.rules.reduce(function (memo, rule) {
  
      if (rule.punySuffix === -1){
        rule.punySuffix = toASCII(rule.suffix);
      }
      if (!internals.endsWith(punyDomain, '.' + rule.punySuffix) && punyDomain !== rule.punySuffix) {
        return memo;
      }
      // This has been commented out as it never seems to run. This is because
      // sub tlds always appear after their parents and we never find a shorter
      // match.
      //if (memo) {
      //  var memoSuffix = Punycode.toASCII(memo.suffix);
      //  if (memoSuffix.length >= punySuffix.length) {
      //    return memo;
      //  }
      //}
      return rule;
    }, null);
};

function strToObj(objStr) {
    var result = {}

    var subObj = {};
    var f = 0;
    for(g of objStr.replace(/[{]/gi, "").split("}")) {
        subObj = {}
        if(f == objStr.replace(/[{]/gi, "").split("}").length-1 || g == undefined) continue;

        for(i of g.split(",.,.")) {
            var [key, value] = i.split("][][");
            if(value == undefined) continue;
            subObj[key.trim()] = value.trim();
        }
        result[f] = subObj;
        f++
    }

    return result
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname
  
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }
  
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];
  
    return hostname;
  }

function getWebName(input) {
    if (typeof input !== 'string') {
        throw new TypeError('Domain name must be a string.');
    }
    
      // Force domain to lowercase.
      var domain = input.slice(0).toLowerCase();
    
      // Handle FQDN.
      // TODO: Simply remove trailing dot?
      if (domain.charAt(domain.length - 1) === '.') {
        domain = domain.slice(0, domain.length - 1);
      }
    
      // Validate and sanitise input.
      var error = internals.validate(domain);
      if (error) {
        return {
          input: input,
          error: {
            message: exports.errorCodes[error],
            code: error
          }
        };
      }
    
      var parsed = {
        input: input,
        tld: null,
        sld: null,
        domain: null,
        subdomain: null,
        listed: false
      };
    
      var domainParts = domain.split('.');
    
      // Non-Internet TLD
      if (domainParts[domainParts.length - 1] === 'local') {
        return parsed;
      }
    
      var handlePunycode = function () {
    
        if (!/xn--/.test(domain)) {
          return parsed;
        }
        if (parsed.domain) {
          parsed.domain = Punycode.toASCII(parsed.domain);
        }
        if (parsed.subdomain) {
          parsed.subdomain = Punycode.toASCII(parsed.subdomain);
        }
        return parsed;
      };
    
      var rule = internals.findRule(domain);
    
      // Unlisted tld.
      if (!rule) {
        if (domainParts.length < 2) {
          return parsed;
        }
        parsed.tld = domainParts.pop();
        parsed.sld = domainParts.pop();
        parsed.domain = [parsed.sld, parsed.tld].join('.');
        if (domainParts.length) {
          parsed.subdomain = domainParts.pop();
        }
        return handlePunycode();
      }
    
      // At this point we know the public suffix is listed.
      parsed.listed = true;
    
      var tldParts = rule.suffix.split('.');
      var privateParts = domainParts.slice(0, domainParts.length - tldParts.length);
    
      if (rule.exception) {
        privateParts.push(tldParts.shift());
      }
    
      parsed.tld = tldParts.join('.');
    
      if (!privateParts.length) {
        return handlePunycode();
      }
    
      if (rule.wildcard) {
        tldParts.unshift(privateParts.pop());
        parsed.tld = tldParts.join('.');
      }
    
      if (!privateParts.length) {
        return handlePunycode();
      }
    
      parsed.sld = privateParts.pop();
      parsed.domain = [parsed.sld,  parsed.tld].join('.');
    
      if (privateParts.length) {
        parsed.subdomain = privateParts.join('.');
      }
    
      return handlePunycode();
}
//#endregion