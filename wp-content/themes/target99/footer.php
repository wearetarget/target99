    </div><!-- #page -->

    <footer class="footer">
        <div class="footer__inner-container layout__service">
            <div class="footer__item">
                <div class="footer__contact-container">
                    <a target="_blank" class="footer__link-to-map" href="https://www.google.com/maps/place/%D1%83%D0%BB.+%D0%9A%D0%B0%D0%BB%D1%8C%D0%B2%D0%B0%D1%80%D0%B8%D0%B9%D1%81%D0%BA%D0%B0%D1%8F+25,+%D0%9C%D0%B8%D0%BD%D1%81%D0%BA,+%D0%91%D0%B5%D0%BB%D0%B0%D1%80%D1%83%D1%81%D1%8C/@53.9061223,27.5202124,18z/data=!3m1!4b1!4m5!3m4!1s0x46dbcff63ca431e5:0xaca8a7241c75a351!8m2!3d53.9061223!4d27.5208913">
                        <div class="footer__contact-info">
                            <?php echo get_theme_mod('target99_contact_info'); ?>
                        </div>
                    </a>
                    <a href="#" class="footer__site-map-link">Карта сайта</a>
                </div>
            </div>
            <div class="footer__item">
                <div class="footer__logo-container">
                    <img class="footer__logo" src="<?php bloginfo('template_url'); ?>/images/logo.png"/>
                    <span class="footer__logo-text"><?php echo get_theme_mod('target99_logo_footer'); ?></span>
                </div>
            </div>
            <div class="footer__item">
                <div class="footer__socials-container">
                    <?php include('templates/template-parts/template-part-socials.php'); ?>
                </div>
            </div>

        </div>
        <?php wp_footer(); ?>
    </footer>

</div><!-- layout -->

</body>

</html>