var main = function() {
	$('#compare').click(function(){
		$('#err').text('');
		$('table#result tr').remove();



		var string1 = $('#original textarea').val();
		var string2 = $('#to_compare textarea').val();

		compare(string1, string2, function(err, result){
			if(err) {
				$('#err').text(err);
				return;
			}
			insert_to_table(result, function(err){
				console.log('result');
				if(err) {
					$('#err').text(err);
				}
			})
		});

	});
}

$(document).ready(main);

var insert_to_table = function(diff_object, callback) {
	if(!diff_object.hasOwnProperty('extra') || !diff_object.hasOwnProperty('different') || !diff_object.hasOwnProperty('missing')) {
		return callback('INTERNAL ERROR');
	}

	async.forEach(Object.keys(diff_object), function(key, key_cb) {
		$.each(diff_object[key], function(index, item){
			var each_row = "<tr>" + "<td>" + item + "</td>" + "</tr>";
			console.log(each_row);
			$('#result_' + key + ' table#result').append(each_row);
		});
	}, function(err){
		if(err) return callback(err);
		return callback(null);
	})

}

var compare = function(str1, str2, callback) {
	process_into_object(str1, function(err, form_object1){
		if(err) return callback(err);
		process_into_object(str2, function(err, form_object2){
			if(err) return callback(err);

			var result = {
				different: [],
				missing: [],
				extra: []
			}

			async.forEach(Object.keys(form_object1), function(key, key_cb) {
				if(!form_object2.hasOwnProperty(key) || form_object2[key].length < form_object1[key].length) {
					result.extra.push(key);
				} else if (form_object2[key].length > form_object1[key].length) {
					result.missing.push(key);
				} else if (form_object2[key].toString() != form_object1[key].toString()) {
					result.different.push(key);
				}
				delete form_object2[key];
				return key_cb();
			}, function(err){
				if(err) return callback(err);
				if(Object.keys(form_object2).length > 0) {
					async.forEach(Object.keys(form_object2), function(key, key_cb) {
						result.missing.push(key);
						return key_cb();
					}, function(err){
						if(err) return callback(err);
						return callback(null, result);
					})
				} else {
					callback(null, result);
				}
			});
		});
	});
}

var process_into_object = function(s, callback) {

    if($('input#form').parent().hasClass('active')) {
        var a = s.split('&');
    }
    else if($('input#cookies').parent().hasClass('active')) {
        var a = s.split(';');
    }
	else callback('unknow compare type')

	var form_object = {};

    console.log(a);

	async.forEachSeries(a, function(field, async_cb){
		var key_value_pair = field.split('=');
        console.log(key_value_pair);
		if(key_value_pair.length < 2) return async_cb('Failed to parse the form');
        for(var i = 2 ; i < key_value_pair.length ; i++) {
            key_value_pair[1] += key_value_pair[i];
        }
		if(form_object.hasOwnProperty(key_value_pair[0])) {
			form_object[key_value_pair[0]].push(key_value_pair[1]);
			form_object[key_value_pair[0]] = _.sortBy(form_object[key_value_pair[0]], function(ss) {
				return ss;
			});
			return async_cb();
		} else {
			form_object[key_value_pair[0]] = [ key_value_pair[1] ];
			return async_cb();
		}
	}, function(err){
		if(err) return callback(err);
		return callback(null, form_object);
	});
}
