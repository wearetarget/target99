<?php
N2Loader::import("models.Layers", "smartslider");
N2Loader::import("models.Item", "smartslider");
?>

<div id="n2-ss-slide-sidebar" class="n2-form-dark n2-ss-editor-panel smartslider-slide-toolbox-slide-active smartslider-slide-layout-default-active">
    <div class="n2-ss-slide-sidebar-crop">
        <div class="n2-panel-titlebar">

            <div class="n2-panel-titlebar-nav n2-panel-titlebar-nav-left">
            </div>

            <span class="n2-panel-titlebar-title"></span>

            <div class="n2-panel-titlebar-nav n2-panel-titlebar-nav-right">
            </div>
        </div>

        <div id="n2-ss-layer-edit">
            <?php
            $layerModel = new N2SmartsliderLayersModel();
            $layerModel->renderForm();
            ?>
        </div>
    </div>
    <div class="n2-ss-slide-sidebar-actions">
        <a href="#" class="n2-ss-slide-show-layers n2-button n2-button-icon n2-button-m" data-n2tip="<?php n2_e('Layer list'); ?>">
            <i class="n2-i n2-i-layerlist"></i>
        </a>
        <a href="#" class="n2-ss-slide-duplicate-layer n2-button n2-button-icon n2-button-m">
            <i class="n2-i n2-i-duplicate"></i>
        </a>
        <a href="#" class="n2-ss-slide-delete-layer n2-button n2-button-icon n2-button-m">
            <i class="n2-i n2-i-delete"></i>
        </a>
    </div>
</div>