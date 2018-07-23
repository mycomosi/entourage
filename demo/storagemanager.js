

export const storagemanager = {

    name: 'Storage Manager',
    subtext: `
    Storage Manager provides tools to read/write 3 types of storage: <a class="typez">local</a>, <a class="typez">session</a>, and <a class="typez">shared</a>.
    `,
    content: `
    <style>
    a.typez {
        text-decoration: underline;
        cursor: pointer;
    }
    span.codeSnip {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bold;
        padding: 5px;
        font-size: 13px;
    }
    </style>
    <h3>Public Methods: (listed in a nice order for you to play around with)</h3>
    <ul>
    <li>put - Example: <span class="codeSnip">demo.StorageManager.put({key: 'test', value: 'This is a test'}, {type:'<span class="exampleType">local</span>'});</span></li>
    <li>get - Example: <span class="codeSnip">demo.StorageManager.get('test', {type:'<span class="exampleType">local</span>'});</span></li>
    <li>info - Example: <span class="codeSnip">demo.StorageManager.info('test', {type:'<span class="exampleType">local</span>'});</span></li>
    <li>serialize - Example: <span class="codeSnip">demo.StorageManager.serialize({type:'<span class="exampleType">local</span>'});</span></li>
    <li>delete - Example: <span class="codeSnip">demo.StorageManager.delete('test', {type:'<span class="exampleType">local</span>'});</span></li>    
</ul>

<h3>Public Prototype Methods: (used internally but also available to the public as they are useful)</h3>
<ul>
    <li>encode - <span class="codeSnip">demo.StorageManager.encode({type: 'object', value: 'some value'});</span><br/>
    <span style="display: block; padding: 20px; font-size: 12px;">(Returns: "eyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOiJzb21lIHZhbHVlIn0=");</span></li>
    <li>decode - <span class="codeSnip">demo.StorageManager.decode("eyJ0eXBlIjoib2JqZWN0IiwidmFsdWUiOiJzb21lIHZhbHVlIn0=");</span><br/>
    <span style="display: block; padding: 20px; font-size: 12px;">(Returns: {type: "object", value: "some value"});</span></li>    
</ul>
    `
};