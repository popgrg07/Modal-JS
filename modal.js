var modalConfig = {
        container: '#modalContainer',
        subContainer: '*[rel=subModalContainer]',
        header: 'modal-header',
        body: 'modal-body',
        footer: 'modal-footer',
        loader: '.modal-btn-loader'
    }

var title           = null,
    self            = null,
    prevIcon        = null,
    callbyEvent     = false,
    modalId         = 0;

/**
 * Parent Modal
 * @return void
 */

$(document).off('click', '*[data-modal-route]').on('click', '*[data-modal-route]', function(e){

    e.preventDefault();
        self            = $(this);
    var type            = self.attr('data-modal-type') ? self.attr('data-modal-type') : 'default',
        modal_url       = self.attr('data-modal-route'),
        callback        = self.attr('data-modal-callback') ? self.attr('data-modal-callback') : false,
        icon            = self.find('*[class^="la"], *[class^="fa"], *[class^="flaticon-"], *[class^="socicon-"]').length ?
                            self.find('*[class^="la"], *[class^="fa"], *[class^="flaticon-"], *[class^="socicon-"]').eq(0) :
                                self.closest('.dropdown-menu').prev('.dropdown-toggle').find('*[class^="la"], *[class^="fa"], *[class^="flaticon-"], *[class^="socicon-"]').eq(0);

        // Dynamic Modal Id
        callbyEvent = true;
        ++modalId;

        document.param = null;

        if(self.attr('data-param')) {
            document.param = self.attr('data-param');
        }

        // get prev icon
        prevIcon        = icon.length ? icon[0].outerHTML : null;
        // update title
        title           = self.attr('data-modal-title') ? self.attr('data-modal-title') : 'Delete';

        // update icon with loader
        $(modalConfig.loader).remove();
        if(self)
            self.attr("disabled","disabled");
        icon.after('<div class="m-loader modal-btn-loader"></div>').end().remove();


        showModal(modal_url, {
            type : type,
            callback: callback
        });
});



/**
 * Child Modal
 * @return void
 */

$(document).off('click', '*[data-sub-modal-route]').on('click', '*[data-sub-modal-route]', function(e){

    e.preventDefault();
        self            = $(this);
        var modal_url   = self.attr('data-sub-modal-route'),
            type        = self.attr('data-modal-type') ? self.attr('data-modal-type') : 'default',
            parent      = self.closest('.modal.show').attr('data-modal-id'),
            callback    = self.attr('data-modal-callback') ? self.attr('data-modal-callback') : false,
            icon        = self.find('*[class^="la"], *[class^="fa"], *[class^="flaticon-"], *[class^="socicon-"]').length ?
                            self.find('*[class^="la"], *[class^="fa"], *[class^="flaticon-"], *[class^="socicon-"]').eq(0) :
                                self.closest('.dropdown-menu').prev('.dropdown-toggle').find('*[class^="la"], *[class^="fa"], *[class^="flaticon-"], *[class^="socicon-"]').eq(0);

        // get prev icon
        prevIcon        = icon.length ? icon[0].outerHTML : null;
        // update title
        title           = self.attr('data-modal-title') ? self.attr('data-modal-title') : 'Delete';

        // update icon with loader
        $(modalConfig.loader).remove();
        if(self)
            self.attr("disabled","disabled");
        icon.after('<div class="m-loader modal-btn-loader"></div>').end().remove();

        callbyEvent = true;
        ++modalId;

        showModal(modal_url, {
            type : type,
            relation: "child",
            parentId: parent,
            callback: callback
        });
        $('.modal.show[data-modal-id='+parent+']').modal('hide');

});


function showModal(modal_url, options = null){
    if(modal_url.length) {

        /**
         * Add Loader Before Modal Call
         */
        addFormLoader();

        ajaxRequest({
            url : modal_url.trim()
        }, function(response) {

            /**
             * Remove Loader After Modal Call
             */
            removeFormLoader();

            if(prevIcon){
                $(modalConfig.loader).after(prevIcon).end();
            }

            $(modalConfig.loader).remove();

            if(!response) {
                toastr.error('Response Error');
            }
            if(response.response && (response.response.status >= 500 || response.response.status == 404)) {
                if(response.response.data && response.response.data[0] && response.response.data[0].data)
                {
                }
                else
                    toastr.error(response.response.statusText);
            } else{
                setModalDom(response, options);
            }
            if(self)
                self.removeAttr("disabled");
        });
    }

}

function setModalDom(response, options = null) {
    var relation = (options && options.hasOwnProperty('relation') )? options.relation : "parent";
    var modalRef = modalConfig.container,
        callback = (options && options.hasOwnProperty('callback') )? options.callback : false;

    if(relation == "child") {

        var childModal = '<div class="modal fade std-modal" rel="subModalContainer" data-parent-modal-id="'+options.parentId+'" data-modal-callback="'+callback+'" data-modal-id="'+modalId+'" tabindex="-1" role="dialog"\
                             aria-labelledby="modalContainerHeader" aria-hidden="true" data-backdrop="static" data-keyboard="false">\
                        </div>';

        $('body').append(childModal);
        modalRef = 'body .modal[data-modal-id='+modalId+']';
    }

    if(!callbyEvent) {
        ++modalId;
    }

    if(options && options.hasOwnProperty('type') && options.type == 'delete') {
        $(modalRef)
            .removeClass('modal-default').addClass('modal-danger')
            .html("").html(response.data)
            .find('.modal-title').html(title)
            .end().modal('show');

    } else {
        $(modalRef).removeClass('modal-danger').addClass('modal-default').html("").html(response.data).modal('show');
    }

    $(modalRef).attr('data-modal-id', modalId);
    onModalInit();
    callbyEvent = false;
}


/**
 * Remove Nested Modal
 */
$(document).off('click', '[data-dismiss=modal]').on('click', '[data-dismiss=modal]', function(e){
    var self            = $(this),
        parentModalId   = self.closest('.modal').attr('data-parent-modal-id'),
        callback        = self.closest('.modal').attr('data-modal-callback') ? self.closest('.modal').attr('data-modal-callback') : false;
        if(parentModalId) {
            var parent          = 'body .modal[data-modal-id='+parentModalId+']';
            $('body .modal-backdrop').remove();
            $(parent).modal('show');
            self.closest('.modal').modal('hide').remove();
        }

        if(callback && window[callback]) {
            window[callback]();
        }
});

/**
 * Show CLient Modal
 */
$(document).off('click', '.openModal').on('click', '.openModal', function(e){
    e.preventDefault();
    var self = $(this),
        modal = self.attr('data-modal-id');
        $("#"+modal).modal('show');
        $("#"+modal).attr('data-modal-id', modal);
        $("#"+modal).on('shown.bs.modal', function (e) {
            if(self.attr('data-callback')) {
                window[self.attr('data-callback')]();
            }

            switch (modal) {
                case "volunteerCreateModal":
                    $('#'+modal).find('.dynamicPetAppendSection').attr('id','newPet_Template_Append_Citizan');
                    break;
                case "applicationNpCreateModal":
                    $('#'+modal).find('.dynamicPetAppendSection').attr('id','newPet_Template_Append_Np');

                    /* Change Np Pet Accordion Options */
                    $('#'+modal).find('.parentAccordion').attr('id','m_pet_accordion_np');
                    $('#'+modal).find('.m-accordion__item-body').attr('data-parent','m_pet_accordion_np');

                    $('#'+modal).find('.m-accordion__item-head').attr('id','m_pet_accordion_np_header');
                    $('#'+modal).find('.m-accordion__item-body').attr('aria-labelledby','m_pet_accordion_np_header');

                    $('#'+modal).find('.m-accordion__item-head').attr('href','#m_pet_accordion_np_body');
                    $('#'+modal).find('.m-accordion__item-body').attr('id','m_pet_accordion_np_body');

                    break;
                default:
                    // statements_def
                    break;
            }

        });
});


function onModalInit() {
    $("input[name=phone], input[name='cell_phone[]']").inputmask("mask", {
        "mask": "(999) 999-9999"
    });
}
