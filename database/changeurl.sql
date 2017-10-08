update wp_posts set guid = replace(guid,'http://target99.herokuapp.com', 'https://target99.herokuapp.com'); 
update wp_commentmeta set meta_value = replace(meta_value, 'http://target99.herokuapp.com', 'https://target99.herokuapp.com'); 
update wp_posts set post_content = replace(post_content,'http://target99.herokuapp.com', 'https://target99.herokuapp.com'); 
update wp_postmeta set meta_value = replace(meta_value, 'http://target99.herokuapp.com', 'https://target99.herokuapp.com'); 
update wp_options set option_value = replace(option_value, 'http://target99.herokuapp.com', 'https://target99.herokuapp.com');